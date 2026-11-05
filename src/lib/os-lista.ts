import { buscar, type ResultadoOS, termosDaBusca } from "./busca"
import { nomeDoMes } from "./format"
import { ordenarOS } from "./os-ordem"
import type { Motor, OrdemServico } from "./types"

/**
 * Lista de O.S. (doc 03, "Lista de O.S."): busca pelo número e pelos campos do motor (mesma regra da
 * 5.6) e filtro por mês ("AAAA-MM" da data de entrada). Sem termo, todas, da mais recente para a mais antiga.
 */
export function listarOS(motores: Motor[], ordens: OrdemServico[], q: string, mes: string): ResultadoOS[] {
  let lista: ResultadoOS[]
  if (termosDaBusca(q).length === 0) {
    const porId = new Map(motores.map((m) => [m.id, m]))
    lista = ordenarOS(ordens).flatMap((os) => {
      const motor = porId.get(os.motorId)
      return motor ? [{ os, motor }] : []
    })
  } else {
    lista = buscar(motores, ordens, q).ordens
  }
  return mes ? lista.filter(({ os }) => os.dataEntrada.slice(0, 7) === mes) : lista
}

/** Meses que têm O.S., do mais recente para o mais antigo. */
export function mesesDasOS(ordens: OrdemServico[]): string[] {
  return [...new Set(ordens.map((o) => o.dataEntrada.slice(0, 7)).filter((m) => /^\d{4}-\d{2}$/.test(m)))].sort().reverse()
}

/** "2026-11" -> "novembro de 2026" */
export function rotuloDoMes(mes: string): string {
  return `${nomeDoMes(mes)} de ${mes.slice(0, 4)}`
}

/** Aceita só "AAAA-MM" válido vindo da URL; qualquer outra coisa vira "" (todos os meses). */
export function mesDaUrl(valor: string): string {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(valor) ? valor : ""
}
