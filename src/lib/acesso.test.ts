import { describe, expect, it } from "vitest"
import { destinoSeguro, emailPermitido } from "./acesso"

describe("acesso", () => {
  it("lista vazia libera qualquer conta; lista restringe, sem diferenciar maiúsculas", () => {
    expect(emailPermitido("a@x.com", "")).toBe(true)
    expect(emailPermitido("a@x.com", undefined)).toBe(true)
    expect(emailPermitido("A@x.com", " a@x.com , b@x.com ")).toBe(true)
    expect(emailPermitido("c@x.com", "a@x.com,b@x.com")).toBe(false)
    expect(emailPermitido(null, "a@x.com")).toBe(false)
  })
  it("destino após o login só aceita caminho interno (RN-19)", () => {
    expect(destinoSeguro("/motores/SIL-000125")).toBe("/motores/SIL-000125")
    expect(destinoSeguro("//evil.com")).toBe("/")
    expect(destinoSeguro("https://evil.com")).toBe("/")
    expect(destinoSeguro("/login")).toBe("/")
    expect(destinoSeguro(null)).toBe("/")
  })
})
