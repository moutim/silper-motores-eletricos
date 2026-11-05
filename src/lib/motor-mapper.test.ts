import { describe, expect, it } from "vitest"
import { formatarPotencia, nomeCurto } from "./motor-format"
import { montarBobinagens, montarMotor } from "./motor-mapper"
import { motorFormSchema, parseDecimal, valoresIniciais } from "./motor-schema"

const ctx = { usuario: "t@x.com", agora: "2026-11-05T12:00:00.000Z" }
const valido = () => ({ ...valoresIniciais(), clienteNome: "Usina Boa Vista" })

describe("validação do formulário (doc 01, seção 6)", () => {
  it("aceita o mínimo: cliente e tipo", () => {
    expect(motorFormSchema.safeParse(valido()).success).toBe(true)
  })
  it("cliente é obrigatório (2 a 120)", () => {
    expect(motorFormSchema.safeParse({ ...valido(), clienteNome: " a " }).success).toBe(false)
    expect(motorFormSchema.safeParse({ ...valido(), clienteNome: "x".repeat(121) }).success).toBe(false)
  })
  it("potência maior que zero; voltas inteiro maior que zero", () => {
    expect(motorFormSchema.safeParse({ ...valido(), potenciaValor: "0" }).success).toBe(false)
    expect(motorFormSchema.safeParse({ ...valido(), potenciaValor: "0,5" }).success).toBe(true)
    const v = valido()
    expect(motorFormSchema.safeParse({ ...v, trabalho: { ...v.trabalho, voltas: "3,5" } }).success).toBe(false)
    expect(motorFormSchema.safeParse({ ...v, trabalho: { ...v.trabalho, voltas: "38" } }).success).toBe(true)
  })
  it("rastreio digitado é validado; no automático é ignorado", () => {
    expect(motorFormSchema.safeParse({ ...valido(), rastreioModo: "MANUAL", rastreio: "ab" }).success).toBe(false)
    expect(motorFormSchema.safeParse({ ...valido(), rastreioModo: "MANUAL", rastreio: "M-0457" }).success).toBe(true)
    expect(motorFormSchema.safeParse({ ...valido(), rastreio: "qualquer coisa" }).success).toBe(true)
  })
  it("decimal com vírgula ou ponto", () => {
    expect(parseDecimal("0,5")).toBe(0.5)
    expect(parseDecimal("5")).toBe(5)
    expect(parseDecimal("")).toBeNull()
    expect(parseDecimal("abc")).toBeNaN()
  })
})

describe("montagem (RN-12)", () => {
  it("trifásico grava uma bobinagem UNICA e descarta a auxiliar", () => {
    const v = { ...valido(), tipoMotor: "TRIFASICO" as const, auxiliar: { passo: "9", voltas: "10", fio: "1", ligacao: "SERIE" as const, camada: "" as const } }
    const m = montarMotor(v, "SIL-000126", "AUTOMATICO", ctx)
    const b = montarBobinagens(v, m.id, ctx)
    expect(b.map((x) => x.funcao)).toEqual(["UNICA"])
  })
  it("monofásico grava TRABALHO e AUXILIAR", () => {
    const v = { ...valido(), tipoMotor: "MONOFASICO" as const }
    const m = montarMotor(v, "SIL-000126", "AUTOMATICO", ctx)
    expect(montarBobinagens(v, m.id, ctx).map((x) => x.funcao)).toEqual(["TRABALHO", "AUXILIAR"])
  })
  it("campos vazios viram nulo e a chave do rastreio é normalizada", () => {
    const m = montarMotor({ ...valido(), marca: " WEG ", potenciaValor: "" }, " M-0457 ".trim(), "MANUAL", ctx)
    expect(m.marca).toBe("WEG")
    expect(m.modelo).toBeNull()
    expect(m.potenciaValor).toBeNull()
    expect(m.potenciaUnidade).toBeNull()
    expect(m.rastreioChave).toBe("m-0457")
    expect(m.criadoPor).toBe("t@x.com")
  })
})

describe("nome do motor", () => {
  it("usa fração para meio CV", () => {
    expect(formatarPotencia(0.5, "CV")).toBe("1/2 CV")
    expect(nomeCurto({ marca: "Eberle", potenciaValor: 0.5, potenciaUnidade: "CV" })).toBe("Eberle 1/2 CV")
    expect(nomeCurto({ marca: "WEG", potenciaValor: 5, potenciaUnidade: "CV" })).toBe("WEG 5 CV")
    expect(nomeCurto({ marca: null, potenciaValor: 3.7, potenciaUnidade: "KW" })).toBe("3,7 kW")
    expect(nomeCurto({ marca: null, potenciaValor: null, potenciaUnidade: null })).toBe("Motor")
  })
})
