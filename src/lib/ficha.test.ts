import { describe, expect, it } from "vitest"
import { gerarSeed } from "../../scripts/seed-data"
import { abaDaUrl, comUnidade, descricaoMotor, linhasBobinagem, linhasDadosGerais, ordenarBobinagens, tituloBobinagem } from "./ficha"
import { potenciaComKw } from "./motor-format"

describe("ficha (doc 03, 3.1)", () => {
  const { motores, bobinagens } = gerarSeed("t")
  const weg = motores[0]

  it("potência com kW como no protótipo", () => {
    expect(potenciaComKw(5, "CV")).toBe("5 CV · 3,7 kW")
    expect(potenciaComKw(0.5, "CV")).toBe("1/2 CV · 0,37 kW")
    expect(potenciaComKw(10, "CV")).toBe("10 CV · 7,4 kW")
    expect(potenciaComKw(3, "KW")).toBe("3 kW")
  })

  it("mostra todos os dados gerais, com unidades", () => {
    const l = Object.fromEntries(linhasDadosGerais(weg).map((x) => [x.rotulo, x.valor]))
    expect(l["Cliente"]).toBe("Usina Boa Vista")
    expect(l["Marca e modelo"]).toBe("WEG W22")
    expect(l["Potência"]).toBe("5 CV · 3,7 kW")
    expect(l["Tensão e corrente"]).toBe("220/380 V · 13,8 A")
    expect(l["RPM"]).toBe("1730")
    expect(l["Item"]).toBeNull()
    expect(Object.keys(l)).toHaveLength(10)
  })

  it("não repete a unidade se já veio digitada", () => {
    expect(comUnidade("220V", "V")).toBe("220V")
    expect(comUnidade("220", "V")).toBe("220 V")
    expect(comUnidade(null, "V")).toBeNull()
  })

  it("bobinagem em português; monofásico em ordem trabalho -> auxiliar", () => {
    const b = bobinagens.find((x) => x.motorId === weg.id)!
    const l = Object.fromEntries(linhasBobinagem(b).map((x) => [x.rotulo, x.valor]))
    expect(l).toEqual({ Passo: "1-9", Voltas: "38", Fio: "0,95 mm", Ligação: "Paralelo", Camada: "Dupla" })
    const mono = motores.find((m) => m.tipoMotor === "MONOFASICO")!
    const ordem = ordenarBobinagens(bobinagens.filter((x) => x.motorId === mono.id).reverse())
    expect(ordem.map(tituloBobinagem)).toEqual(["Bobina de trabalho", "Bobina auxiliar"])
    expect(descricaoMotor(weg)).toBe("Trifásico · Usina Boa Vista")
  })

  it("a aba vem da URL e cai em dados quando inválida", () => {
    expect(abaDaUrl("os")).toBe("os")
    expect(abaDaUrl("fotos")).toBe("fotos")
    expect(abaDaUrl("x")).toBe("dados")
    expect(abaDaUrl(undefined)).toBe("dados")
  })
})
