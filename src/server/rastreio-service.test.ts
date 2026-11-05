import { describe, expect, it } from "vitest"
import { montarBobinagens, montarMotor } from "@/lib/motor-mapper"
import { motorFormSchema, valoresIniciais, type MotorFormValues } from "@/lib/motor-schema"
import { normalizarRastreio } from "@/lib/rastreio"
import type { Bobinagem, Motor } from "@/lib/types"
import { criarMotor, preverRastreio, type PortaMotores } from "./rastreio-service"

/** Planilha em memória. Cada operação cede o controle, para as chamadas simultâneas se intercalarem. */
function portaEmMemoria(inicial: string[] = []) {
  const linhas: (Motor | null)[] = inicial.map((r) => ({ rastreio: r, rastreioChave: normalizarRastreio(r) }) as Motor)
  const bobinagens: Bobinagem[] = []
  let sequencia = 0
  const ceder = () => new Promise<void>((r) => setTimeout(r, Math.random() * 3))
  const porta: PortaMotores = {
    async lerChaves() {
      await ceder()
      return linhas.map((m) => m?.rastreioChave ?? "")
    },
    async acrescentarMotor(motor) {
      await ceder()
      linhas.push(motor) // o append é atômico
      return { linha: linhas.length + 1 }
    },
    async limparLinhaMotor(linha) {
      await ceder()
      linhas[linha - 2] = null
    },
    async acrescentarBobinagens(b) {
      await ceder()
      bobinagens.push(...b)
    },
    async ultimoDaSequencia() {
      await ceder()
      return sequencia
    },
    async gravarSequencia(_p, n) {
      sequencia = Math.max(sequencia, n)
    },
  }
  return { porta, linhas, bobinagens }
}

const ctx = { usuario: "t", agora: "2026-11-05T12:00:00.000Z" }
const montarCom = (v: MotorFormValues) => (rastreio: string, origem: "AUTOMATICO" | "MANUAL") => {
  const motor = montarMotor(v, rastreio, origem, ctx)
  return { motor, bobinagens: montarBobinagens(v, motor.id, ctx) }
}
const form = (extra: Partial<MotorFormValues> = {}) => ({ ...valoresIniciais(), clienteNome: "Cliente", ...extra })

describe("rastreio (RN-02, RN-04, RN-03)", () => {
  it("automático continua a sequência e pula números já ocupados", async () => {
    const { porta } = portaEmMemoria(["SIL-000125", "SIL-000130"])
    const r = await criarMotor(porta, { modo: "AUTOMATICO", montar: montarCom(form()) })
    expect(r.ok && r.motor.rastreio).toBe("SIL-000131")
    expect(r.ok && r.motor.rastreioOrigem).toBe("AUTOMATICO")
  })

  it("previsão mostra o próximo número", async () => {
    const { porta } = portaEmMemoria(["SIL-000125"])
    expect(await preverRastreio(porta)).toBe("SIL-000126")
  })

  it("digitado duplicado é recusado, sem diferenciar maiúsculas nem espaços", async () => {
    const { porta, linhas } = portaEmMemoria(["M-0457"])
    const r = await criarMotor(porta, { modo: "MANUAL", digitado: "  m-0457 ", montar: montarCom(form()) })
    expect(r).toEqual({ ok: false, erro: "RASTREIO_EM_USO" })
    expect(linhas).toHaveLength(1)
  })

  it("digitado novo é aceito como digitado", async () => {
    const { porta } = portaEmMemoria()
    const r = await criarMotor(porta, { modo: "MANUAL", digitado: " M-0457 ", montar: montarCom(form()) })
    expect(r.ok && r.motor.rastreio).toBe("M-0457")
    expect(r.ok && r.motor.rastreioOrigem).toBe("MANUAL")
  })

  it("dois cadastros automáticos simultâneos nunca geram o mesmo rastreio", async () => {
    for (let rodada = 0; rodada < 20; rodada++) {
      const { porta, linhas } = portaEmMemoria(["SIL-000125"])
      const rs = await Promise.all(
        Array.from({ length: 5 }, () => criarMotor(porta, { modo: "AUTOMATICO", montar: montarCom(form()) })),
      )
      const rastreios = rs.map((r) => (r.ok ? r.motor.rastreio : null))
      expect(rastreios.every(Boolean)).toBe(true)
      expect(new Set(rastreios).size).toBe(5)
      const gravados = linhas.filter(Boolean).map((m) => m!.rastreioChave)
      expect(new Set(gravados).size).toBe(gravados.length)
    }
  })

  it("dois digitados iguais ao mesmo tempo: só um vence", async () => {
    for (let rodada = 0; rodada < 20; rodada++) {
      const { porta, linhas } = portaEmMemoria()
      const rs = await Promise.all([
        criarMotor(porta, { modo: "MANUAL", digitado: "X-1", montar: montarCom(form()) }),
        criarMotor(porta, { modo: "MANUAL", digitado: "x-1", montar: montarCom(form()) }),
      ])
      expect(rs.filter((r) => r.ok)).toHaveLength(1)
      expect(linhas.filter(Boolean)).toHaveLength(1)
    }
  })

  it("automático e digitado do mesmo número ao mesmo tempo também não repetem", async () => {
    for (let rodada = 0; rodada < 20; rodada++) {
      const { porta, linhas } = portaEmMemoria(["SIL-000125"])
      const rs = await Promise.all([
        criarMotor(porta, { modo: "AUTOMATICO", montar: montarCom(form()) }),
        criarMotor(porta, { modo: "MANUAL", digitado: "SIL-000126", montar: montarCom(form()) }),
      ])
      const ok = rs.filter((r) => r.ok)
      const gravados = linhas.filter(Boolean).map((m) => m!.rastreioChave)
      expect(new Set(gravados).size).toBe(gravados.length)
      expect(ok.length).toBeGreaterThanOrEqual(1)
    }
  })

  it("RN-12: trifásico grava 1 bobinagem; monofásico grava 2", async () => {
    const a = portaEmMemoria()
    await criarMotor(a.porta, { modo: "AUTOMATICO", montar: montarCom(form({ tipoMotor: "TRIFASICO" })) })
    expect(a.bobinagens.map((b) => b.funcao)).toEqual(["UNICA"])
    const b = portaEmMemoria()
    await criarMotor(b.porta, { modo: "AUTOMATICO", montar: montarCom(form({ tipoMotor: "MONOFASICO" })) })
    expect(b.bobinagens.map((x) => x.funcao)).toEqual(["TRABALHO", "AUXILIAR"])
  })

  it("o formulário usado nos testes é válido", () => {
    expect(motorFormSchema.safeParse(form()).success).toBe(true)
  })
})
