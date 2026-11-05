import { describe, expect, it } from "vitest"
import { formatarData, formatarMoeda, hojeSaoPaulo, mesCorrente, nomeDoMes, semAcento } from "./format"

describe("formatadores pt-BR", () => {
  it("moeda", () => {
    expect(formatarMoeda(1234.5)).toBe("R$ 1.234,50")
    expect(formatarMoeda(0)).toBe("R$ 0,00")
    expect(formatarMoeda(18450)).toBe("R$ 18.450,00")
  })
  it("data dd/mm/aaaa sem mudar de dia", () => {
    expect(formatarData("2026-11-02")).toBe("02/11/2026")
  })
  it("hoje e mês corrente usam America/Sao_Paulo", () => {
    // 01/12 01:30 UTC ainda é 30/11 em São Paulo (UTC-3)
    const d = new Date("2026-12-01T01:30:00Z")
    expect(hojeSaoPaulo(d)).toBe("2026-11-30")
    expect(mesCorrente(d)).toBe("2026-11")
    expect(nomeDoMes("2026-11")).toBe("novembro")
  })
  it("sem acento", () => {
    expect(semAcento("Metalúrgica Alfa")).toBe(semAcento("METALURGICA alfa"))
  })
})
