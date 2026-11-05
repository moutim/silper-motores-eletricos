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
