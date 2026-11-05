import { describe, expect, it } from "vitest"
import { gerarSeed } from "../../scripts/seed-data"
import { buscar } from "./busca"
import { listarOS, mesDaUrl, mesesDasOS, rotuloDoMes } from "./os-lista"
import type { Motor, OrdemServico } from "./types"

describe("lista de O.S.", () => {
  const { motores, ordens } = gerarSeed("t")

  it("sem filtros: todas, da mais recente para a mais antiga, com o motor", () => {
    const l = listarOS(motores, ordens, "", "")
    expect(l).toHaveLength(ordens.length)
    expect(l.map((x) => x.os.dataEntrada)).toEqual([...l.map((x) => x.os.dataEntrada)].sort().reverse())
    expect(l[0].motor.id).toBe(l[0].os.motorId)
  })

  it("filtra por mês e combina com a busca", () => {
    expect(listarOS(motores, ordens, "", "2026-10").map((x) => x.os.numero)).toEqual(["4790", "4755", "4702"])
    expect(listarOS(motores, ordens, "weg", "2026-10").map((x) => x.os.numero)).toEqual(["4702"])
    expect(listarOS(motores, ordens, "4310", "")).toHaveLength(2)
    expect(listarOS(motores, ordens, "4310", "2026-03")).toHaveLength(1)
  })

  it("meses disponíveis e rótulos", () => {
    expect(mesesDasOS(ordens)).toEqual(["2026-11", "2026-10", "2026-03", "2025-07"])
    expect(rotuloDoMes("2026-03")).toBe("março de 2026")
    expect(mesDaUrl("2026-13")).toBe("")
    expect(mesDaUrl("x")).toBe("")
    expect(mesDaUrl("2026-03")).toBe("2026-03")
  })
})

describe("desempenho da busca (doc 01, seção 7: menos de 300 ms com 10 mil motores)", () => {
  const { motores: base, ordens: osBase } = gerarSeed("t")
  const marcas = ["WEG", "Eberle", "Voges", "Kohlbach", "Nova", "Brasil"]
  const motores: Motor[] = Array.from({ length: 10_000 }, (_, i) => ({
    ...base[i % base.length],
    id: `m${i}`,
    rastreio: `SIL-${String(i + 1).padStart(6, "0")}`,
    marca: marcas[i % marcas.length],
    clienteNome: `Cliente número ${i % 700} Ltda`,
    potenciaValor: [0.5, 1, 3, 5, 10][i % 5],
    criadoEm: new Date(1_700_000_000_000 + i * 1000).toISOString(),
  }))
  const ordens: OrdemServico[] = Array.from({ length: 20_000 }, (_, i) => ({
    ...osBase[i % osBase.length],
    id: `o${i}`,
    motorId: `m${i % 10_000}`,
    numero: String(1000 + (i % 9000)),
  }))

  it("responde abaixo de 300 ms com 10 mil motores e 20 mil O.S.", () => {
    buscar(motores, ordens, "aquecer") // aquece o motor de JS
    const t0 = performance.now()
    const r = buscar(motores, ordens, "weg 5 cv cliente 12")
    const ms = performance.now() - t0
    expect(r.motores.length).toBeGreaterThan(0)
    expect(ms).toBeLessThan(300)
    console.log(`busca com 10 mil motores: ${ms.toFixed(0)} ms`)
  })
})
