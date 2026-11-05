import { potenciaComKw } from "./motor-format"
import type { Bobinagem, Motor, TipoMotor } from "./types"

export interface Linha {
  rotulo: string
  valor: string | null
  /** Realça a linha (por exemplo: mudou desde a abertura da O.S.). */
  destaque?: boolean
}

export const ROTULO_TIPO: Record<TipoMotor, string> = { TRIFASICO: "Trifásico", MONOFASICO: "Monofásico" }
const ROTULO_LIGACAO = { SERIE: "Série", PARALELO: "Paralelo" } as const
const ROTULO_CAMADA = { UNICA: "Única", DUPLA: "Dupla" } as const

/** Acrescenta a unidade só quando o valor digitado não a traz ("220" -> "220 V"; "220V" fica). */
export function comUnidade(valor: string | null, unidade: string): string | null {
  if (!valor) return null
  return /[a-z]/i.test(valor) ? valor : `${valor} ${unidade}`
}

const juntar = (...partes: (string | null)[]) => {
  const p = partes.filter(Boolean) as string[]
  return p.length ? p.join(" · ") : null
}

/** Campos técnicos do motor (o retrato da O.S. guarda exatamente estes, sem o cliente). */
export type DadosTecnicos = Pick<
  Motor,
  | "marca" | "modelo" | "tipoEquipamento" | "potenciaValor" | "potenciaUnidade"
  | "tensao" | "corrente" | "rpm" | "fatorServico" | "item" | "pacote" | "diametro" | "tipoMotor"
>

/** Todos os dados gerais da ficha (a implementação mostra todos, doc 03, 3.1). */
export function linhasDadosGerais(m: Motor): Linha[] {
  return [{ rotulo: "Cliente", valor: m.clienteNome }, ...linhasTecnicas(m)]
}

/** Dados técnicos sem o cliente. */
export function linhasTecnicas(m: DadosTecnicos): Linha[] {
  return [
    { rotulo: "Marca e modelo", valor: [m.marca, m.modelo].filter(Boolean).join(" ") || null },
    { rotulo: "Tipo de equipamento", valor: m.tipoEquipamento },
    {
      rotulo: "Potência",
      valor: m.potenciaValor === null ? null : potenciaComKw(m.potenciaValor, m.potenciaUnidade),
    },
    { rotulo: "Tensão e corrente", valor: juntar(comUnidade(m.tensao, "V"), comUnidade(m.corrente, "A")) },
    { rotulo: "RPM", valor: m.rpm },
    { rotulo: "F.S.", valor: m.fatorServico },
    { rotulo: "Item", valor: m.item },
    { rotulo: "Pacote", valor: m.pacote },
    { rotulo: "Diâmetro", valor: m.diametro },
  ]
}

export function linhasBobinagem(b: Pick<Bobinagem, "passo" | "voltas" | "fio" | "ligacao" | "camada">): Linha[] {
  return [
    { rotulo: "Passo", valor: b.passo },
    { rotulo: "Voltas", valor: b.voltas === null ? null : String(b.voltas) },
    { rotulo: "Fio", valor: b.fio },
    { rotulo: "Ligação", valor: b.ligacao ? ROTULO_LIGACAO[b.ligacao] : null },
    { rotulo: "Camada", valor: b.camada ? ROTULO_CAMADA[b.camada] : null },
  ]
}

const ORDEM = { UNICA: 0, TRABALHO: 0, AUXILIAR: 1 } as const

export function ordenarBobinagens<T extends Pick<Bobinagem, "funcao">>(bobinagens: T[]): T[] {
  return [...bobinagens].sort((a, b) => ORDEM[a.funcao] - ORDEM[b.funcao])
}

export function tituloBobinagem(b: Pick<Bobinagem, "funcao">): string {
  return b.funcao === "UNICA" ? "Bobinagem" : b.funcao === "TRABALHO" ? "Bobina de trabalho" : "Bobina auxiliar"
}

/** "Trifásico · Usina Boa Vista" */
export function descricaoMotor(m: Pick<Motor, "tipoMotor" | "clienteNome">): string {
  return `${ROTULO_TIPO[m.tipoMotor]} · ${m.clienteNome}`
}

/** Abas da ficha (`?aba=`). Fica fora do componente de cliente para o servidor poder ler. */
export type Aba = "dados" | "os" | "fotos"
export const ABAS: readonly Aba[] = ["dados", "os", "fotos"]

export function abaDaUrl(valor: string | undefined): Aba {
  return ABAS.includes(valor as Aba) ? (valor as Aba) : "dados"
}
