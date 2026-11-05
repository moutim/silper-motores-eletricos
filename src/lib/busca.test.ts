import { describe, expect, it } from "vitest"
import { gerarSeed } from "../../scripts/seed-data"
import { buscar, lerParametros, montarQuery, opcoesDosFiltros, termosDaBusca } from "./busca"

describe("busca (doc 01, 5.6)", () => {
  const { motores, ordens } = gerarSeed("t")
  const rastreios = (r: { motores: { rastreio: string }[] }) => r.motores.map((m) => m.rastreio).sort()

  it("termos combinam com E, em qualquer campo", () => {
    expect(rastreios(buscar(motores, ordens, "weg 5 cv 1730"))).toEqual(["SIL-000125"])
    expect(rastreios(buscar(motores, ordens, "granja"))).toEqual(["SIL-000109", "SIL-000118"])
    expect(rastreios(buscar(motores, ordens, "granja voges"))).toEqual(["SIL-000109"])
  })

  it("acha por rastreio e por parte dele", () => {
    expect(rastreios(buscar(motores, ordens, "SIL-000124"))).toEqual(["SIL-000124"])
    expect(rastreios(buscar(motores, ordens, "000092"))).toEqual(["SIL-000092"])
  })

  it("com e sem acento dão o mesmo resultado, e maiúsculas não importam", () => {
    const a = buscar(motores, ordens, "metalúrgica")
    const b = buscar(motores, ordens, "METALURGICA")
    expect(rastreios(a)).toEqual(rastreios(b))
    expect(a.motores).toHaveLength(2)
  })

  it("potência fracionada pela forma exibida e pelo número", () => {
    expect(rastreios(buscar(motores, ordens, "1/2 cv"))).toEqual(["SIL-000124"])
    expect(rastreios(buscar(motores, ordens, "0,5"))).toEqual(["SIL-000124"])
  })

  it("acha O.S. pelo número, inclusive repetido, e leva ao motor dela", () => {
    const r = buscar(motores, ordens, "4310")
    expect(r.ordens).toHaveLength(2)
    expect(new Set(r.ordens.map((x) => x.os.id)).size).toBe(2)
    expect(r.ordens.every((x) => x.motor.rastreio === "SIL-000125")).toBe(true)
    expect(r.motores).toHaveLength(0)
  })

  it("O.S. também casa pelos campos do motor (número + marca)", () => {
    expect(buscar(motores, ordens, "4821 weg").ordens).toHaveLength(1)
    expect(buscar(motores, ordens, "4821 voges").ordens).toHaveLength(0)
  })

  it("sem termo lista os motores mais recentes e nenhuma O.S.", () => {
    const r = buscar(motores, ordens, "  ")
    expect(r.motores).toHaveLength(motores.length)
    expect(r.ordens).toHaveLength(0)
  })

  it("filtros avançados se somam à busca", () => {
    expect(rastreios(buscar(motores, ordens, "", { marca: "weg" }))).toEqual(["SIL-000092", "SIL-000118", "SIL-000125"])
    expect(rastreios(buscar(motores, ordens, "granja", { marca: "WEG" }))).toEqual(["SIL-000118"])
    expect(rastreios(buscar(motores, ordens, "", { potencia: "5 CV", rpm: "1730" }))).toEqual(["SIL-000125"])
    expect(buscar(motores, ordens, "4310", { marca: "Voges" }).ordens).toHaveLength(0)
  })

  it("desativados: aparecem na busca, mas não onde se pede só ativos", () => {
    const desativado = motores.map((m) => (m.rastreio === "SIL-000092" ? { ...m, ativo: false } : m))
    expect(buscar(desativado, ordens, "000092").motores).toHaveLength(1)
    expect(buscar(desativado, ordens, "000092", {}, { incluirDesativados: false }).motores).toHaveLength(0)
  })

  it("opções dos filtros: sem repetição e em ordem natural", () => {
    const o = opcoesDosFiltros(motores)
    expect(o.marca).toEqual(["Eberle", "Voges", "WEG"])
    expect(o.potencia).toEqual(["1/2 CV", "3 CV", "5 CV", "10 CV"])
    expect(o.rpm).toEqual(["1720", "1730", "1740", "1750", "3450"])
  })

  it("termos: recolhe espaços e repetições", () => {
    expect(termosDaBusca("  WEG   weg  5 ")).toEqual(["weg", "5"])
  })

  it("URL: lê e monta os parâmetros", () => {
    const p = lerParametros({ q: "weg 5", marca: "WEG", pm: "3", po: "x", lixo: "1" })
    expect(p).toEqual({ q: "weg 5", filtros: { marca: "WEG" }, paginasMotores: 3, paginasOS: 1 })
    expect(montarQuery(p)).toBe("?q=weg+5&marca=WEG&pm=3")
    expect(montarQuery({})).toBe("")
  })
})
