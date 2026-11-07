import { describe, expect, it } from "vitest"
import { clientesCadastrados } from "./clientes"

const m = (clienteNome: string, ativo = true) => ({ clienteNome, ativo })

describe("clientesCadastrados", () => {
  it("remove repetidos (caixa, acento e espaços) e ordena", () => {
    expect(clientesCadastrados([m("Usina Boa Vista"), m("metalúrgica  alfa"), m("METALURGICA ALFA"), m("Abc")])).toEqual([
      "Abc",
      "metalúrgica alfa",
      "Usina Boa Vista",
    ])
  })
  it("ignora motores desativados e nomes vazios", () => {
    expect(clientesCadastrados([m("Fora", false), m("  ")])).toEqual([])
  })
})
