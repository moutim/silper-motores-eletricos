import { describe, expect, it } from "vitest"
import { gerarSeed } from "../../scripts/seed-data"
import { indicadoresDoInicio, motoresRecentes, ultimasOS } from "./inicio"
import { formularioDeModelo } from "./motor-base"

describe("Início (doc 01, 5.5)", () => {
  const seed = () => gerarSeed("t@x")

  it("RN-15: faturamento soma só as O.S. do mês corrente e ignora as sem valor", () => {
    const { motores, ordens } = seed()
    ordens[0].valorNota = 1000.1 // 4821, 2026-11-02
    ordens[1].valorNota = 200.2 // 4790, 2026-10-28 (outro mês)
    ordens[2].valorNota = null // 4755
    const i = indicadoresDoInicio(motores, ordens, "2026-11")
    expect(i.faturamento).toBe(1000.1)
    expect(i.osNoMes).toBe(1)
    expect(indicadoresDoInicio(motores, ordens, "2026-10").faturamento).toBe(200.2)
  })

  it("sem valores no mês: R$ 0,00 e sem O.S. nenhuma", () => {
    const { motores, ordens } = seed()
    expect(indicadoresDoInicio(motores, ordens, "2030-01")).toMatchObject({ faturamento: 0, osNoMes: 0 })
    expect(indicadoresDoInicio([], [], "2026-11")).toEqual({
      motoresAtivos: 0, faturamento: 0, osNoMes: 0, clientesAtendidos: 0,
    })
  })

  it("soma em centavos, sem erro de ponto flutuante", () => {
    const { motores, ordens } = seed()
    ordens.slice(0, 3).forEach((o) => {
      o.dataEntrada = "2026-11-01"
      o.valorNota = 0.1
    })
    expect(indicadoresDoInicio(motores, ordens, "2026-11").faturamento).toBe(0.3)
  })

  it("motores cadastrados conta só os ativos", () => {
    const { motores, ordens } = seed()
    motores[5].ativo = false
    expect(indicadoresDoInicio(motores, ordens, "2026-11").motoresAtivos).toBe(5)
  })

  it("clientes atendidos: nomes distintos (sem acento) de motores ativos com ao menos uma O.S.", () => {
    const { motores, ordens } = seed()
    // O.S. no seed: 125 (Usina Boa Vista), 124 (Padaria Central), 121 (Metalúrgica Alfa), 118 (Granja Sol)
    expect(indicadoresDoInicio(motores, ordens, "2026-11").clientesAtendidos).toBe(4)
    motores.find((m) => m.rastreio === "SIL-000121")!.clienteNome = "METALURGICA  ALFA"
    motores.find((m) => m.rastreio === "SIL-000092")!.clienteNome = "metalúrgica alfa" // sem O.S.: não conta
    expect(indicadoresDoInicio(motores, ordens, "2026-11").clientesAtendidos).toBe(4)
    motores.find((m) => m.rastreio === "SIL-000118")!.ativo = false
    expect(indicadoresDoInicio(motores, ordens, "2026-11").clientesAtendidos).toBe(3)
  })

  it("últimas O.S.: as 4 mais recentes por data, com o motor", () => {
    const { motores, ordens } = seed()
    const u = ultimasOS(ordens, motores, 4)
    expect(u.map((x) => x.os.numero)).toEqual(["4821", "4790", "4755", "4702"])
    expect(u[0].motor.rastreio).toBe("SIL-000125")
  })

  it("recentes: do mais novo para o mais antigo, só desta conta e só motores ativos", () => {
    const { motores, acessos } = seed()
    const nomes = (a = acessos) => motoresRecentes(a, motores, "t@x", 4).map((m) => m.rastreio)
    expect(nomes()).toEqual(["SIL-000125", "SIL-000124", "SIL-000121"])
    expect(motoresRecentes(acessos, motores, "outro@x", 4)).toEqual([])
    motores.find((m) => m.rastreio === "SIL-000124")!.ativo = false
    expect(nomes()).toEqual(["SIL-000125", "SIL-000121"])
    expect(motoresRecentes(acessos, motores, "t@x", 1)).toHaveLength(1)
  })
})

describe("motor-base (RN-10)", () => {
  const { motores, bobinagens } = gerarSeed("t")

  it("copia dados técnicos e bobinagem, mas não cliente nem rastreio", () => {
    const base = motores.find((m) => m.rastreio === "SIL-000125")!
    const f = formularioDeModelo(base, bobinagens.filter((b) => b.motorId === base.id))
    expect(f.clienteNome).toBe("")
    expect(f.rastreio).toBe("")
    expect(f.rastreioModo).toBe("AUTOMATICO")
    expect(f).toMatchObject({ marca: "WEG", modelo: "W22", potenciaValor: "5", tensao: "220/380", rpm: "1730", tipoMotor: "TRIFASICO" })
    expect(f.trabalho).toMatchObject({ passo: "1-9", voltas: "38", fio: "0,95 mm", ligacao: "PARALELO", camada: "DUPLA" })
  })

  it("monofásico copia as duas bobinas", () => {
    const base = motores.find((m) => m.rastreio === "SIL-000124")!
    const f = formularioDeModelo(base, bobinagens.filter((b) => b.motorId === base.id))
    expect(f.tipoMotor).toBe("MONOFASICO")
    expect(f.trabalho.voltas).toBe("48")
    expect(f.auxiliar.voltas).toBe("52")
  })

  it("não altera o motor original", () => {
    const base = motores[0]
    const antes = JSON.stringify(base)
    const f = formularioDeModelo(base, bobinagens.filter((b) => b.motorId === base.id))
    f.marca = "Outra"
    f.trabalho.voltas = "1"
    expect(JSON.stringify(base)).toBe(antes)
  })
})
