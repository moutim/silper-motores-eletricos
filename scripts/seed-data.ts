/**
 * Dados de exemplo extraídos do protótipo (telas Início, Busca, Ficha, Ficha Mono, Ficha O.S.,
 * O.S. aberta e Escolher motor). O que o protótipo não mostra fica vazio: nada foi inventado.
 * Divergências do protótipo estão em docs/DECISOES.md (D-12).
 */
import { montarRetrato } from "@/lib/retrato"
import { normalizarRastreio } from "@/lib/rastreio"
import type { AcessoRecente, Bobinagem, Motor, OrdemServico, PotenciaUnidade, SequenciaRastreio, TipoMotor } from "@/lib/types"

const T0 = "2026-11-05T12:00:00.000Z"

interface Def {
  rastreio: string
  marca: string
  modelo?: string
  potencia: number
  unidade?: PotenciaUnidade
  cliente: string
  tipo: TipoMotor
  tensao?: string
  corrente?: string
  rpm?: string
  bob: Array<Pick<Bobinagem, "funcao" | "passo" | "voltas" | "fio" | "ligacao" | "camada">>
}

const vazia = (funcao: Bobinagem["funcao"] = "UNICA") => ({
  funcao, passo: null, voltas: null, fio: null, ligacao: null, camada: null,
})

const DEFS: Def[] = [
  {
    rastreio: "SIL-000125", marca: "WEG", modelo: "W22", potencia: 5, cliente: "Usina Boa Vista", tipo: "TRIFASICO",
    tensao: "220/380", corrente: "13,8", rpm: "1730",
    bob: [{ funcao: "UNICA", passo: "1-9", voltas: 38, fio: "0,95 mm", ligacao: "PARALELO", camada: "DUPLA" }],
  },
  {
    rastreio: "SIL-000124", marca: "Eberle", potencia: 0.5, cliente: "Padaria Central", tipo: "MONOFASICO",
    tensao: "110", corrente: "5,2", rpm: "3450",
    bob: [
      { funcao: "TRABALHO", passo: "1-6", voltas: 48, fio: "0,45 mm", ligacao: "SERIE", camada: "UNICA" },
      { funcao: "AUXILIAR", passo: "1-6", voltas: 52, fio: "0,40 mm", ligacao: "SERIE", camada: "UNICA" },
    ],
  },
  { rastreio: "SIL-000121", marca: "Voges", potencia: 10, cliente: "Metalúrgica Alfa", tipo: "TRIFASICO", rpm: "1740", bob: [vazia()] },
  { rastreio: "SIL-000118", marca: "WEG", potencia: 3, cliente: "Granja Sol", tipo: "TRIFASICO", rpm: "1720", bob: [vazia()] },
  { rastreio: "SIL-000109", marca: "Voges", potencia: 5, cliente: "Granja Sol", tipo: "TRIFASICO", bob: [vazia()] },
  { rastreio: "SIL-000092", marca: "WEG", potencia: 5, cliente: "Metalúrgica Alfa", tipo: "TRIFASICO", rpm: "1750", bob: [vazia()] },
]

interface OsDef {
  numero: string
  rastreio: string
  data: string
  defeito?: string
  servico?: string
}

const OS_DEFS: OsDef[] = [
  { numero: "4821", rastreio: "SIL-000125", data: "2026-11-02", defeito: "Não parte", servico: "Rebobinado completo" },
  { numero: "4790", rastreio: "SIL-000124", data: "2026-10-28" },
  { numero: "4755", rastreio: "SIL-000121", data: "2026-10-21" },
  { numero: "4702", rastreio: "SIL-000118", data: "2026-10-14" },
  { numero: "4310", rastreio: "SIL-000125", data: "2026-03-14", defeito: "Esquentando", servico: "Troca de rolamentos" },
  // Mesmo número da anterior, em outra visita (RN-08). O protótipo mostra só o texto abaixo.
  { numero: "4310", rastreio: "SIL-000125", data: "2025-07-20", servico: "Número repetido é permitido" },
]

export function gerarSeed(usuario: string) {
  const audit = { criadoEm: T0, atualizadoEm: T0, criadoPor: usuario, atualizadoPor: usuario }
  const id = () => crypto.randomUUID()

  const motores: Motor[] = []
  const bobinagens: Bobinagem[] = []
  const porRastreio = new Map<string, { motor: Motor; bob: Bobinagem[] }>()

  for (const d of DEFS) {
    const motor: Motor = {
      id: id(), rastreio: d.rastreio, rastreioChave: normalizarRastreio(d.rastreio), rastreioOrigem: "AUTOMATICO",
      clienteNome: d.cliente, marca: d.marca, modelo: d.modelo ?? null, tipoEquipamento: null,
      potenciaValor: d.potencia, potenciaUnidade: d.unidade ?? "CV",
      tensao: d.tensao ?? null, corrente: d.corrente ?? null, rpm: d.rpm ?? null, fatorServico: null,
      item: null, pacote: null, diametro: null, tipoMotor: d.tipo, ativo: true, modeloOrigemId: null, ...audit,
    }
    const bob = d.bob.map((b): Bobinagem => ({ id: id(), motorId: motor.id, ...b, ...audit }))
    motores.push(motor)
    bobinagens.push(...bob)
    porRastreio.set(d.rastreio, { motor, bob })
  }

  const ordens: OrdemServico[] = OS_DEFS.map((o) => {
    const { motor, bob } = porRastreio.get(o.rastreio)!
    return {
      id: id(), motorId: motor.id, numero: o.numero, dataEntrada: o.data,
      defeito: o.defeito ?? null, servicoExecutado: o.servico ?? null, observacoes: null, valorNota: null,
      retratoTecnico: montarRetrato(motor, bob), ...audit,
    }
  })

  const sequencia: SequenciaRastreio[] = [{ prefixo: "SIL-", ultimoNumero: 125 }]
  // "Acessados recentemente" do protótipo: WEG 5 CV, Eberle 1/2 CV, Voges 10 CV.
  const acessos: AcessoRecente[] = ["SIL-000125", "SIL-000124", "SIL-000121"].map((r, i) => ({
    usuario, motorId: porRastreio.get(r)!.motor.id, acessadoEm: new Date(Date.parse(T0) - i * 3600_000).toISOString(),
  }))

  return { motores, bobinagens, ordens, sequencia, acessos }
}
