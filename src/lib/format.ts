import { config } from "./config"

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

/** 1234.5 -> "R$ 1.234,50" */
export function formatarMoeda(valor: number): string {
  return moeda.format(valor).replace(/ /g, " ")
}

/** "2026-11-02" -> "02/11/2026" (sem converter fuso: é uma data de calendário). */
export function formatarData(iso: string): string {
  const [a, m, d] = iso.slice(0, 10).split("-")
  return `${d}/${m}/${a}`
}

/** Data de hoje em America/Sao_Paulo, "AAAA-MM-DD". */
export function hojeSaoPaulo(agora: Date = new Date()): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: config.fusoHorario,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora)
  return partes
}

/** "AAAA-MM" do mês corrente em America/Sao_Paulo. */
export function mesCorrente(agora: Date = new Date()): string {
  return hojeSaoPaulo(agora).slice(0, 7)
}

const nomesMeses = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]

export function nomeDoMes(mes: string): string {
  return nomesMeses[Number(mes.slice(5, 7)) - 1]
}

/** Sem acento e sem diferenciar maiúsculas (busca, clientes distintos). */
export function semAcento(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
}
