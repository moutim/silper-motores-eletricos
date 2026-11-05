import { describe, expect, it } from "vitest"
import { secaoAtiva } from "./navegacao"

describe("secaoAtiva", () => {
  it("Início só em /", () => {
    expect(secaoAtiva("/")).toBe("inicio")
  })
  it("a ficha do motor e suas telas pertencem a Motores", () => {
    expect(secaoAtiva("/motores")).toBe("motores")
    expect(secaoAtiva("/motores/SIL-000125")).toBe("motores")
    expect(secaoAtiva("/motores/SIL-000125/os/nova")).toBe("motores")
    expect(secaoAtiva("/m/SIL-000125")).toBe("motores")
  })
  it("a O.S. aberta pertence a O.S.", () => {
    expect(secaoAtiva("/os")).toBe("os")
    expect(secaoAtiva("/os/abc-123")).toBe("os")
  })
  it("rota desconhecida não ativa nenhuma aba", () => {
    expect(secaoAtiva("/login")).toBeNull()
  })
})
