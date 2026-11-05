import { describe, expect, it } from "vitest"
import { gerarSeed } from "../../scripts/seed-data"
import { montarRetrato } from "./retrato"

describe("retrato (RN-09, RN-18)", () => {
  it("é uma cópia: editar a ficha depois não muda o retrato", () => {
    const { motores, bobinagens } = gerarSeed("t")
    const motor = motores[0]
    const bob = bobinagens.filter((b) => b.motorId === motor.id)
    const retrato = montarRetrato(motor, bob)
    const voltasAntes = retrato.bobinagens[0].voltas

    bob[0].voltas = 99
    motor.rpm = "9999"
    expect(retrato.bobinagens[0].voltas).toBe(voltasAntes)
    expect(retrato.motor.rpm).not.toBe("9999")
  })
})
