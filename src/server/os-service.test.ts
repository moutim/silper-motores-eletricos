import { describe, expect, it } from "vitest"
import { formularioDoMotor } from "@/lib/motor-edicao"
import { formularioDaOS } from "@/lib/os-mapper"
import { osFormSchema, type OSFormValues } from "@/lib/os-schema"
import { compararRetrato } from "@/lib/retrato-diff"
import { ordenarOS } from "@/lib/os-ordem"
import { normalizarRastreio } from "@/lib/rastreio"
import type { Bobinagem, Motor, OrdemServico } from "@/lib/types"
import { gerarSeed } from "../../scripts/seed-data"
import { editarMotor, type PortaDados } from "./motor-service"
import { criarOS, editarOS, type PortaOS } from "./os-service"

function mundo() {
  const seed = gerarSeed("seed")
  const motores = seed.motores.map((m) => ({ ...m }))
  const bobs: (Bobinagem | null)[] = seed.bobinagens.map((b) => ({ ...b }))
  const ordens: OrdemServico[] = []
  const portaOS: PortaOS = {
    async motorPorRastreio(r) {
      const motor = motores.find((m) => m.rastreioChave === normalizarRastreio(r))
      return motor ? { motor, bobinagens: bobs.filter((b): b is Bobinagem => !!b && b.motorId === motor.id) } : null
    },
    async acrescentarOS(os) {
      ordens.push(os)
    },
    async buscarOS(id) {
      const i = ordens.findIndex((o) => o.id === id)
      return i === -1 ? null : { linha: i + 2, os: ordens[i] }
    },
    async atualizarOS(linha, os) {
      ordens[linha - 2] = os
    },
  }
  const portaDados: PortaDados = {
    async motores() {
      return motores.map((motor, i) => ({ linha: i + 2, motor }))
    },
    async atualizarMotor(l, m) {
      motores[l - 2] = m
    },
    async bobinagensDe(id) {
      return bobs.flatMap((b, i) => (b && b.motorId === id ? [{ linha: i + 2, bobinagem: b }] : []))
    },
    async atualizarBobinagem(l, b) {
      bobs[l - 2] = b
    },
    async acrescentarBobinagens(n) {
      bobs.push(...n)
    },
    async limparBobinagem(l) {
      bobs[l - 2] = null
    },
    async acessos() {
      return []
    },
    async atualizarAcesso() {},
    async acrescentarAcesso() {},
  }
  const motorPorId = async (id: string) => motores.find((m) => m.id === id) ?? null
  return { motores, bobs, ordens, portaOS, portaDados, motorPorId }
}

const ctx = { usuario: "u@x.com", agora: "2026-11-05T12:00:00.000Z" }
const form = (extra: Partial<OSFormValues> = {}): OSFormValues => ({
  numero: "4821",
  dataEntrada: "2026-11-02",
  defeito: "Não parte",
  servicoExecutado: "Rebobinado completo",
  observacoes: "",
  valorNota: "1.234,56",
  ...extra,
})

describe("validação da O.S. (doc 01, seção 6)", () => {
  it("aceita o formulário completo e o mínimo", () => {
    expect(osFormSchema.safeParse(form()).success).toBe(true)
    expect(osFormSchema.safeParse(form({ defeito: "", servicoExecutado: "", valorNota: "" })).success).toBe(true)
  })
  it("número obrigatório, até 20 caracteres", () => {
    expect(osFormSchema.safeParse(form({ numero: "  " })).success).toBe(false)
    expect(osFormSchema.safeParse(form({ numero: "x".repeat(21) })).success).toBe(false)
    expect(osFormSchema.safeParse(form({ numero: "x".repeat(20) })).success).toBe(true)
  })
  it("data válida e não futura", () => {
    expect(osFormSchema.safeParse(form({ dataEntrada: "2026-02-30" })).success).toBe(false)
    expect(osFormSchema.safeParse(form({ dataEntrada: "" })).success).toBe(false)
    expect(osFormSchema.safeParse(form({ dataEntrada: "2999-01-01" })).success).toBe(false)
  })
  it("valor da nota: reais, maior ou igual a zero", () => {
    expect(osFormSchema.safeParse(form({ valorNota: "0" })).success).toBe(true)
    expect(osFormSchema.safeParse(form({ valorNota: "R$ 1.234,56" })).success).toBe(true)
    expect(osFormSchema.safeParse(form({ valorNota: "-5" })).success).toBe(false)
    expect(osFormSchema.safeParse(form({ valorNota: "abc" })).success).toBe(false)
  })
})

describe("O.S. (RN-06, RN-08, RN-14, RN-18)", () => {
  it("duas O.S. com o mesmo número salvam sem aviso e ficam separadas", async () => {
    const w = mundo()
    const a = await criarOS(w.portaOS, ctx, "SIL-000125", form({ numero: "4310", dataEntrada: "2025-07-20" }))
    const b = await criarOS(w.portaOS, ctx, "sil-000125", form({ numero: "4310", dataEntrada: "2026-03-14" }))
    expect(a.ok && b.ok).toBe(true)
    expect(w.ordens).toHaveLength(2)
    expect(w.ordens[0].id).not.toBe(w.ordens[1].id)
    expect(ordenarOS(w.ordens).map((o) => o.dataEntrada)).toEqual(["2026-03-14", "2025-07-20"])
  })

  it("duas visitas geram duas O.S. no mesmo motor, com o valor da nota", async () => {
    const w = mundo()
    await criarOS(w.portaOS, ctx, "SIL-000125", form({ numero: "1" }))
    await criarOS(w.portaOS, ctx, "SIL-000125", form({ numero: "2", valorNota: "" }))
    const motor = w.motores.find((m) => m.rastreio === "SIL-000125")!
    expect(w.ordens.filter((o) => o.motorId === motor.id)).toHaveLength(2)
    expect(w.ordens[0].valorNota).toBe(1234.56)
    expect(w.ordens[1].valorNota).toBeNull()
  })

  it("não abre O.S. em motor inexistente ou desativado", async () => {
    const w = mundo()
    expect(await criarOS(w.portaOS, ctx, "NADA", form())).toEqual({ ok: false, erro: "MOTOR_NAO_ENCONTRADO" })
    w.motores.find((m) => m.rastreio === "SIL-000125")!.ativo = false
    expect(await criarOS(w.portaOS, ctx, "SIL-000125", form())).toEqual({ ok: false, erro: "MOTOR_DESATIVADO" })
    expect(w.ordens).toHaveLength(0)
  })

  it("RN-09 e RN-18: editar a ficha depois não muda o retrato da O.S. antiga", async () => {
    const w = mundo()
    await criarOS(w.portaOS, ctx, "SIL-000125", form())
    const os = w.ordens[0]
    const voltasNaAbertura = os.retratoTecnico.bobinagens[0].voltas
    expect(voltasNaAbertura).toBe(38)

    const motor = w.motores.find((m) => m.rastreio === "SIL-000125") as Motor
    const bobs = w.bobs.filter((b): b is Bobinagem => !!b && b.motorId === motor.id)
    const f = formularioDoMotor(motor, bobs)
    f.trabalho.voltas = "40"
    f.rpm = "1750"
    await editarMotor(w.portaDados, { usuario: "e", agora: "2026-11-06T10:00:00.000Z" }, "SIL-000125", f, motor.atualizadoEm)

    const depois = w.ordens[0]
    expect(depois.retratoTecnico.bobinagens[0].voltas).toBe(38)
    expect(depois.retratoTecnico.motor.rpm).toBe("1730")

    const atual = w.motores.find((m) => m.rastreio === "SIL-000125")!
    const cmp = compararRetrato(depois.retratoTecnico, atual, w.bobs.filter((b): b is Bobinagem => !!b && b.motorId === atual.id))
    expect(cmp.houveMudanca).toBe(true)
    const voltas = (s: typeof cmp.naAbertura) => s.flatMap((x) => x.linhas).find((l) => l.rotulo === "Voltas")!
    expect(voltas(cmp.naAbertura)).toMatchObject({ valor: "38", mudou: true })
    expect(voltas(cmp.fichaAtual)).toMatchObject({ valor: "40", mudou: true })
    const rpm = (s: typeof cmp.naAbertura) => s.flatMap((x) => x.linhas).find((l) => l.rotulo === "RPM")!
    expect(rpm(cmp.naAbertura)).toMatchObject({ valor: "1730", mudou: true })
    const fio = (s: typeof cmp.naAbertura) => s.flatMap((x) => x.linhas).find((l) => l.rotulo === "Fio")!
    expect(fio(cmp.naAbertura).mudou).toBe(false)
  })

  it("sem mudança na ficha, nada é destacado", async () => {
    const w = mundo()
    await criarOS(w.portaOS, ctx, "SIL-000125", form())
    const motor = w.motores.find((m) => m.rastreio === "SIL-000125")!
    const cmp = compararRetrato(w.ordens[0].retratoTecnico, motor, w.bobs.filter((b): b is Bobinagem => !!b && b.motorId === motor.id))
    expect(cmp.houveMudanca).toBe(false)
  })

  it("trocar o tipo na ficha destaca a bobina que surgiu", async () => {
    const w = mundo()
    await criarOS(w.portaOS, ctx, "SIL-000125", form())
    const motor = w.motores.find((m) => m.rastreio === "SIL-000125") as Motor
    const bobs = w.bobs.filter((b): b is Bobinagem => !!b && b.motorId === motor.id)
    await editarMotor(w.portaDados, { usuario: "e", agora: "2026-11-06T10:00:00.000Z" }, "SIL-000125", { ...formularioDoMotor(motor, bobs), tipoMotor: "MONOFASICO" }, motor.atualizadoEm)
    const atual = w.motores.find((m) => m.rastreio === "SIL-000125")!
    const cmp = compararRetrato(w.ordens[0].retratoTecnico, atual, w.bobs.filter((b): b is Bobinagem => !!b && b.motorId === atual.id))
    const aux = cmp.fichaAtual.find((s) => s.titulo === "Bobina auxiliar")!
    expect(aux.linhas.every((l) => l.mudou)).toBe(true)
  })
})

describe("editar O.S. (RN-09)", () => {
  it("atualiza os dados, mantém o retrato e grava quem alterou", async () => {
    const w = mundo()
    await criarOS(w.portaOS, ctx, "SIL-000125", form())
    const os = w.ordens[0]
    const r = await editarOS(w.portaOS, { usuario: "e@x.com", agora: "2026-11-07T10:00:00.000Z" }, os.id, { ...formularioDaOS(os), observacoes: "Trocado o rolamento", valorNota: "2.000" }, os.atualizadoEm, w.motorPorId)
    expect(r).toEqual({ ok: true })
    const depois = w.ordens[0]
    expect(depois.observacoes).toBe("Trocado o rolamento")
    expect(depois.valorNota).toBe(2000)
    expect(depois.retratoTecnico).toEqual(os.retratoTecnico)
    expect(depois.motorId).toBe(os.motorId)
    expect(depois.criadoPor).toBe("u@x.com")
    expect(depois.atualizadoPor).toBe("e@x.com")
  })

  it("recusa em conflito, O.S. inexistente e motor desativado", async () => {
    const w = mundo()
    await criarOS(w.portaOS, ctx, "SIL-000125", form())
    const os = w.ordens[0]
    const c2 = { usuario: "e", agora: "2026-11-07T10:00:00.000Z" }
    await editarOS(w.portaOS, c2, os.id, formularioDaOS(os), os.atualizadoEm, w.motorPorId)
    expect(await editarOS(w.portaOS, { ...c2, agora: "2026-11-07T11:00:00.000Z" }, os.id, formularioDaOS(os), os.atualizadoEm, w.motorPorId)).toEqual({ ok: false, erro: "CONFLITO" })
    expect(await editarOS(w.portaOS, c2, "nada", formularioDaOS(os), "", w.motorPorId)).toEqual({ ok: false, erro: "NAO_ENCONTRADA" })
    w.motores.find((m) => m.id === os.motorId)!.ativo = false
    expect(await editarOS(w.portaOS, c2, os.id, formularioDaOS(os), w.ordens[0].atualizadoEm, w.motorPorId)).toEqual({ ok: false, erro: "MOTOR_DESATIVADO" })
  })
})
