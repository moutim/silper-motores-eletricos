import { describe, expect, it } from "vitest"
import {
  formatarRastreio, mensagemRastreioEmUso, normalizarRastreio, proximoNumeroRastreio, validarRastreioDigitado,
} from "./rastreio"

describe("rastreio", () => {
  it("normaliza sem espaços nas pontas e sem diferenciar maiúsculas (RN-04)", () => {
    expect(normalizarRastreio("  SIL-000125 ")).toBe("sil-000125")
    expect(normalizarRastreio("m-0457")).toBe(normalizarRastreio("M-0457"))
  })

  it("valida o rastreio digitado", () => {
    expect(validarRastreioDigitado(" M-0457 ")).toEqual({ ok: true, valor: "M-0457" })
    expect(validarRastreioDigitado("ab").ok).toBe(false)
    expect(validarRastreioDigitado("x".repeat(33)).ok).toBe(false)
    expect(validarRastreioDigitado("A B").ok).toBe(false)
    expect(validarRastreioDigitado("A/B").ok).toBe(false)
    expect(validarRastreioDigitado("Novo").ok).toBe(false) // colide com /motores/novo
  })

  it("formata com prefixo e dígitos", () => {
    expect(formatarRastreio(126)).toBe("SIL-000126")
    expect(formatarRastreio(5, "MOT-", 4)).toBe("MOT-0005")
  })

  it("mensagem padrão de duplicado", () => {
    expect(mensagemRastreioEmUso("M-0457")).toBe("M-0457 já está em uso por outro motor. Digite outro número.")
  })

  it("próximo número pula os ocupados, inclusive digitados, e nunca reutiliza (RN-02)", () => {
    expect(proximoNumeroRastreio(125, [])).toBe(126)
    expect(proximoNumeroRastreio(125, ["SIL-000130", "sil-000127", "M-0457", "SIL-ABC"])).toBe(131)
    expect(proximoNumeroRastreio(0, ["SIL-000009"])).toBe(10)
  })
})
