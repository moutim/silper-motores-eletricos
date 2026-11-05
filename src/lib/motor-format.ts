import type { Motor, PotenciaUnidade } from "./types"

const FRACOES: Record<string, string> = { "0.25": "1/4", "0.5": "1/2", "0.75": "3/4", "1.5": "1 1/2" }

export function formatarPotencia(valor: number, unidade: PotenciaUnidade | null): string {
  const frac = FRACOES[String(valor)]
  const numero = frac ?? String(valor).replace(".", ",")
  const un = unidade === "KW" ? "kW" : (unidade ?? "")
  return `${numero} ${un}`.trim()
}

/** Nome curto do motor: "WEG 5 CV", "Eberle 1/2 CV". */
export function nomeCurto(m: Pick<Motor, "marca" | "potenciaValor" | "potenciaUnidade">): string {
  const potencia = m.potenciaValor === null ? "" : formatarPotencia(m.potenciaValor, m.potenciaUnidade)
  return [m.marca, potencia].filter(Boolean).join(" ") || "Motor"
}

const KW_POR_CV = 0.7355
const KW_POR_HP = 0.7457

/** Potência em kW para exibir ao lado de CV/HP (como no protótipo: "5 CV · 3,7 kW"). */
export function potenciaEmKw(valor: number, unidade: PotenciaUnidade | null): number | null {
  if (unidade === "CV") return valor * KW_POR_CV
  if (unidade === "HP") return valor * KW_POR_HP
  if (unidade === "KW") return valor
  return null
}

function decimalPtBr(n: number): string {
  // abaixo de 1 kW usa 2 casas; a partir de 1 kW usa 1 casa
  const casas = n < 1 ? 2 : 1
  return n.toFixed(casas).replace(/\.?0+$/, "").replace(".", ",")
}

/** "5 CV · 3,7 kW". Em kW não repete a conversão. */
export function potenciaComKw(valor: number, unidade: PotenciaUnidade | null): string {
  const base = formatarPotencia(valor, unidade)
  if (unidade === "KW" || unidade === null) return base
  const kw = potenciaEmKw(valor, unidade)
  return kw === null ? base : `${base} · ${decimalPtBr(kw)} kW`
}
