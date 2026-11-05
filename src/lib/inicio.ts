import { semAcento } from "./format"
import { ordenarOS } from "./os-ordem"
import type { AcessoRecente, Motor, OrdemServico } from "./types"

export interface Indicadores {
  motoresAtivos: number
  /** Soma de `valorNota` das O.S. do mês; O.S. sem valor não entram (RN-15). */
  faturamento: number
  osNoMes: number
  clientesAtendidos: number
}

/** Cartões da Início (doc 01, 5.5). `mes` é "AAAA-MM" em America/Sao_Paulo. */
export function indicadoresDoInicio(motores: Motor[], ordens: OrdemServico[], mes: string): Indicadores {
  const ativos = motores.filter((m) => m.ativo)
  const noMes = ordens.filter((o) => o.dataEntrada.slice(0, 7) === mes)
  const centavos = noMes.reduce((soma, o) => soma + (o.valorNota === null ? 0 : Math.round(o.valorNota * 100)), 0)

  const comOS = new Set(ordens.map((o) => o.motorId))
  const clientes = new Set(
    ativos.filter((m) => comOS.has(m.id)).map((m) => semAcento(m.clienteNome).replace(/\s+/g, " ")),
  )
  clientes.delete("")

  return {
    motoresAtivos: ativos.length,
    faturamento: centavos / 100,
    osNoMes: noMes.length,
    clientesAtendidos: clientes.size,
  }
}

/** As `n` O.S. mais recentes por data de entrada (desempate por criação), com o motor delas. */
export function ultimasOS(ordens: OrdemServico[], motores: Motor[], n: number) {
  const porId = new Map(motores.map((m) => [m.id, m]))
  return ordenarOS(ordens)
    .flatMap((os) => {
      const motor = porId.get(os.motorId)
      return motor ? [{ os, motor }] : []
    })
    .slice(0, n)
}

/** Motores abertos mais recentemente por esta conta; ignora desativados e motores que não existem mais. */
export function motoresRecentes(acessos: AcessoRecente[], motores: Motor[], usuario: string, n: number): Motor[] {
  const porId = new Map(motores.map((m) => [m.id, m]))
  return acessos
    .filter((a) => a.usuario === usuario)
    .sort((a, b) => b.acessadoEm.localeCompare(a.acessadoEm))
    .flatMap((a) => {
      const m = porId.get(a.motorId)
      return m?.ativo ? [m] : []
    })
    .slice(0, n)
}
