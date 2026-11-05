import { describe, expect, it } from "vitest"
import { iniciais } from "./iniciais"

describe("iniciais", () => {
  it("usa a primeira e a última palavra", () => {
    expect(iniciais("João Silva")).toBe("JS")
    expect(iniciais("Maria de Souza Lima")).toBe("ML")
  })
  it("aceita um nome só e vazio", () => {
    expect(iniciais("silper")).toBe("S")
    expect(iniciais("  ")).toBe("?")
  })
})
