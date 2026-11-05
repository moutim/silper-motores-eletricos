import { describe, expect, it } from "vitest"
import { gerarSeed } from "../../../scripts/seed-data"
import { fromRow, headersOf, toRow } from "./codec"
import { BOBINAGENS, MOTORES, ORDENS_SERVICO, TABELAS } from "./schema"

describe("codec da planilha", () => {
  const seed = gerarSeed("t")

  it("ida e volta de um motor preserva tipos e nulos", () => {
    const m = seed.motores[0]
    expect(fromRow(MOTORES, toRow(MOTORES, m))).toEqual(m)
    const sem = seed.motores[2]
    expect(fromRow(MOTORES, toRow(MOTORES, sem))).toEqual(sem)
  })

  it("passo '1-9' continua texto e voltas continua número", () => {
    const b = seed.bobinagens[0]
    const linha = toRow(BOBINAGENS, b)
    expect(linha).toContain("1-9")
    expect(fromRow(BOBINAGENS, linha).voltas).toBe(38)
  })

  it("O.S. guarda o retrato como JSON e aceita número repetido (RN-08)", () => {
    const os = seed.ordens.filter((o) => o.numero === "4310")
    expect(os).toHaveLength(2)
    expect(os[0].id).not.toBe(os[1].id)
    expect(fromRow(ORDENS_SERVICO, toRow(ORDENS_SERVICO, os[0]))).toEqual(os[0])
  })

  it("cada aba tem cabeçalhos únicos", () => {
    for (const t of TABELAS) {
      const h = headersOf(t as never)
      expect(new Set(h).size).toBe(h.length)
    }
  })
})

describe("seed (protótipo)", () => {
  it("monofásico tem 2 bobinagens e trifásico 1 (RN-12)", () => {
    const { motores, bobinagens } = gerarSeed("t")
    for (const m of motores) {
      const n = bobinagens.filter((b) => b.motorId === m.id).length
      expect(n).toBe(m.tipoMotor === "MONOFASICO" ? 2 : 1)
    }
  })
  it("rastreios do seed são únicos", () => {
    const { motores } = gerarSeed("t")
    expect(new Set(motores.map((m) => m.rastreioChave)).size).toBe(motores.length)
  })
})
