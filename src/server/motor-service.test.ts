import { describe, expect, it } from "vitest"
import { formularioDoMotor } from "@/lib/motor-edicao"
import type { MotorFormValues } from "@/lib/motor-schema"
import type { AcessoRecente, Bobinagem, Motor } from "@/lib/types"
import { gerarSeed } from "../../scripts/seed-data"
import { alterarAtivo, editarMotor, type PortaDados, registrarAcesso } from "./motor-service"

function portaEmMemoria() {
  const seed = gerarSeed("seed")
  const motores = seed.motores.map((m) => ({ ...m }))
  const bobs: (Bobinagem | null)[] = seed.bobinagens.map((b) => ({ ...b }))
  const acessos: AcessoRecente[] = []
  const porta: PortaDados = {
    async motores() {
      return motores.map((motor, i) => ({ linha: i + 2, motor }))
    },
    async atualizarMotor(linha, motor) {
      motores[linha - 2] = motor
    },
    async bobinagensDe(motorId) {
      return bobs.flatMap((b, i) => (b && b.motorId === motorId ? [{ linha: i + 2, bobinagem: b }] : []))
    },
    async atualizarBobinagem(linha, b) {
      bobs[linha - 2] = b
    },
    async acrescentarBobinagens(novas) {
      bobs.push(...novas)
    },
    async limparBobinagem(linha) {
      bobs[linha - 2] = null
    },
    async acessos() {
      return acessos.map((acesso, i) => ({ linha: i + 2, acesso }))
    },
    async atualizarAcesso(linha, a) {
      acessos[linha - 2] = a
    },
    async acrescentarAcesso(a) {
      acessos.push(a)
    },
  }
  return { porta, motores, bobs, acessos, seed }
}

const ctx = { usuario: "editor@x.com", agora: "2026-11-06T10:00:00.000Z" }
const formDe = (m: Motor, bobs: Bobinagem[], extra: Partial<MotorFormValues> = {}) => ({
  ...formularioDoMotor(m, bobs),
  ...extra,
})
const doMotor = (e: ReturnType<typeof portaEmMemoria>, rastreio: string) => {
  const motor = e.motores.find((m) => m.rastreio === rastreio)!
  return { motor, bobs: e.bobs.filter((b): b is Bobinagem => !!b && b.motorId === motor.id) }
}

describe("editar ficha (RN-09, RN-12)", () => {
  it("atualiza os dados, mantém rastreio e criação, grava quem alterou", async () => {
    const e = portaEmMemoria()
    const { motor, bobs } = doMotor(e, "SIL-000125")
    const r = await editarMotor(e.porta, ctx, "sil-000125", formDe(motor, bobs, { clienteNome: "Outro Cliente", rpm: "1750" }), motor.atualizadoEm)
    expect(r).toEqual({ ok: true })
    const depois = doMotor(e, "SIL-000125").motor
    expect(depois.clienteNome).toBe("Outro Cliente")
    expect(depois.rpm).toBe("1750")
    expect(depois.rastreio).toBe("SIL-000125")
    expect(depois.id).toBe(motor.id)
    expect(depois.criadoEm).toBe(motor.criadoEm)
    expect(depois.criadoPor).toBe("seed")
    expect(depois.atualizadoPor).toBe("editor@x.com")
    expect(depois.atualizadoEm).toBe(ctx.agora)
  })

  it("edita as voltas da bobinagem sem criar linhas novas", async () => {
    const e = portaEmMemoria()
    const { motor, bobs } = doMotor(e, "SIL-000125")
    const f = formDe(motor, bobs)
    f.trabalho.voltas = "40"
    await editarMotor(e.porta, ctx, "SIL-000125", f, motor.atualizadoEm)
    const depois = doMotor(e, "SIL-000125").bobs
    expect(depois).toHaveLength(1)
    expect(depois[0].voltas).toBe(40)
    expect(depois[0].id).toBe(bobs[0].id)
  })

  it("trifásico -> monofásico: a única vira trabalho e a auxiliar é criada", async () => {
    const e = portaEmMemoria()
    const { motor, bobs } = doMotor(e, "SIL-000125")
    const f = formDe(motor, bobs, { tipoMotor: "MONOFASICO" })
    f.auxiliar = { passo: "1-6", voltas: "52", fio: "0,40 mm", ligacao: "SERIE", camada: "UNICA" }
    await editarMotor(e.porta, ctx, "SIL-000125", f, motor.atualizadoEm)
    const depois = doMotor(e, "SIL-000125").bobs
    expect(depois.map((b) => b.funcao).sort()).toEqual(["AUXILIAR", "TRABALHO"])
    expect(depois.find((b) => b.funcao === "TRABALHO")!.id).toBe(bobs[0].id)
    expect(depois.find((b) => b.funcao === "TRABALHO")!.voltas).toBe(38)
    expect(depois.find((b) => b.funcao === "AUXILIAR")!.voltas).toBe(52)
  })

  it("monofásico -> trifásico: a auxiliar é descartada e a de trabalho vira única", async () => {
    const e = portaEmMemoria()
    const { motor, bobs } = doMotor(e, "SIL-000124")
    expect(bobs).toHaveLength(2)
    await editarMotor(e.porta, ctx, "SIL-000124", formDe(motor, bobs, { tipoMotor: "TRIFASICO" }), motor.atualizadoEm)
    const depois = doMotor(e, "SIL-000124").bobs
    expect(depois.map((b) => b.funcao)).toEqual(["UNICA"])
    expect(depois[0].voltas).toBe(48)
  })

  it("ida e volta nunca repete (motor, função)", async () => {
    const e = portaEmMemoria()
    for (const tipo of ["MONOFASICO", "TRIFASICO", "MONOFASICO", "TRIFASICO"] as const) {
      const { motor, bobs } = doMotor(e, "SIL-000125")
      await editarMotor(e.porta, { ...ctx, agora: new Date(Date.now() + Math.random() * 1e6).toISOString() }, "SIL-000125", formDe(motor, bobs, { tipoMotor: tipo }), motor.atualizadoEm)
      const funcoes = doMotor(e, "SIL-000125").bobs.map((b) => b.funcao)
      expect(new Set(funcoes).size).toBe(funcoes.length)
    }
  })

  it("recusa quando outra pessoa alterou o motor antes (conflito)", async () => {
    const e = portaEmMemoria()
    const { motor, bobs } = doMotor(e, "SIL-000125")
    const versaoLida = motor.atualizadoEm
    await editarMotor(e.porta, ctx, "SIL-000125", formDe(motor, bobs, { rpm: "1" }), versaoLida)
    const { motor: m2, bobs: b2 } = doMotor(e, "SIL-000125")
    const r = await editarMotor(e.porta, { ...ctx, agora: "2026-11-06T11:00:00.000Z" }, "SIL-000125", formDe(m2, b2, { rpm: "2" }), versaoLida)
    expect(r).toEqual({ ok: false, erro: "CONFLITO" })
    expect(doMotor(e, "SIL-000125").motor.rpm).toBe("1")
  })

  it("não edita motor desativado nem inexistente", async () => {
    const e = portaEmMemoria()
    const { motor, bobs } = doMotor(e, "SIL-000125")
    await alterarAtivo(e.porta, ctx, "SIL-000125", false)
    const atual = doMotor(e, "SIL-000125").motor
    expect(await editarMotor(e.porta, ctx, "SIL-000125", formDe(motor, bobs), atual.atualizadoEm)).toEqual({ ok: false, erro: "DESATIVADO" })
    expect(await editarMotor(e.porta, ctx, "XXX", formDe(motor, bobs), "")).toEqual({ ok: false, erro: "NAO_ENCONTRADO" })
  })
})

describe("desativar (RN-17)", () => {
  it("desativa e reativa, mantendo o rastreio e os dados", async () => {
    const e = portaEmMemoria()
    await alterarAtivo(e.porta, ctx, "sil-000125", false)
    const off = doMotor(e, "SIL-000125").motor
    expect(off.ativo).toBe(false)
    expect(off.rastreio).toBe("SIL-000125")
    expect(off.atualizadoPor).toBe("editor@x.com")
    await alterarAtivo(e.porta, ctx, "SIL-000125", true)
    expect(doMotor(e, "SIL-000125").motor.ativo).toBe(true)
    expect(await alterarAtivo(e.porta, ctx, "nada", false)).toEqual({ ok: false, erro: "NAO_ENCONTRADO" })
  })
})

describe("acesso recente", () => {
  it("cria uma linha por (conta, motor) e só atualiza o horário ao reabrir", async () => {
    const e = portaEmMemoria()
    await registrarAcesso(e.porta, "a@x.com", "m1", "2026-11-06T10:00:00Z")
    await registrarAcesso(e.porta, "a@x.com", "m1", "2026-11-06T11:00:00Z")
    await registrarAcesso(e.porta, "a@x.com", "m2", "2026-11-06T11:30:00Z")
    expect(e.acessos).toHaveLength(2)
    expect(e.acessos[0].acessadoEm).toBe("2026-11-06T11:00:00Z")
  })
})
