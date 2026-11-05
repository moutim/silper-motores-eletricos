import type { OrdemServico } from "./types"

/** Mais recente primeiro: data de entrada e, no empate, ordem de criação (doc 01, 5.5). */
export function ordenarOS<T extends Pick<OrdemServico, "dataEntrada" | "criadoEm">>(lista: T[]): T[] {
  return [...lista].sort(
    (a, b) => b.dataEntrada.localeCompare(a.dataEntrada) || b.criadoEm.localeCompare(a.criadoEm),
  )
}

/** "{defeito} · {serviço}" para a linha do histórico. */
export function resumoOS(os: Pick<OrdemServico, "defeito" | "servicoExecutado">): string {
  return [os.defeito, os.servicoExecutado].filter(Boolean).join(" · ")
}
