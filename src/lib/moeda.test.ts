import { describe, expect, it } from "vitest"
import { formatarMoeda } from "./format"
import { moedaParaCampo, parseMoeda } from "./moeda"
import { ordenarOS, resumoOS } from "./os-ordem"

describe("moeda (R$ 1.234,56)", () => {
  it("lê vírgula, milhar e ponto decimal", () => {
    expect(parseMoeda("1234,56")).toBe(1234.56)
    expect(parseMoeda("1.234,56")).toBe(1234.56)
    expect(parseMoeda("R$ 1.234,56")).toBe(1234.56)
    expect(parseMoeda("1234.56")).toBe(1234.56)
    expect(parseMoeda("1.234")).toBe(1234)
    expect(parseMoeda("0")).toBe(0)
    expect(parseMoeda("12,5")).toBe(12.5)
  })
  it("vazio é nulo e lixo é inválido", () => {
    expect(parseMoeda("")).toBeNull()
    expect(parseMoeda("  ")).toBeNull()
    for (const ruim of ["abc", "1,234,56", "12,345", "1..2", "--1"]) expect(parseMoeda(ruim)).toBeNaN()
  })
  it("formata para o campo e para a tela", () => {
    expect(moedaParaCampo(1234.5)).toBe("1.234,50")
    expect(formatarMoeda(1234.56)).toBe("R$ 1.234,56")
  })
})

describe("ordem e resumo da O.S.", () => {
  it("empate de data: a criada por último vem primeiro", () => {
    const l = ordenarOS([
      { dataEntrada: "2026-11-02", criadoEm: "1" },
      { dataEntrada: "2026-11-02", criadoEm: "2" },
      { dataEntrada: "2026-12-01", criadoEm: "0" },
    ])
    expect(l.map((x) => x.criadoEm)).toEqual(["0", "2", "1"])
  })
  it("resumo junta defeito e serviço", () => {
    expect(resumoOS({ defeito: "Não parte", servicoExecutado: "Rebobinado completo" })).toBe("Não parte · Rebobinado completo")
    expect(resumoOS({ defeito: null, servicoExecutado: "Troca" })).toBe("Troca")
    expect(resumoOS({ defeito: null, servicoExecutado: null })).toBe("")
  })
})
