/**
 * Valor em reais digitado no campo. Aceita "1234,56", "1.234,56" e "1234.56". Devolve `null` se vazio
 * e `NaN` se inválido. Com vírgula, o ponto é separador de milhar; sem vírgula, um ponto seguido de
 * 1 ou 2 dígitos é decimal e de 3 dígitos é milhar ("1.234" = 1234).
 */
export function parseMoeda(entrada: string): number | null {
  const v = entrada.replace(/R\$|\s/gi, "")
  if (v === "") return null
  let normal: string
  if (v.includes(",")) {
    if (!/^\d{1,3}(\.\d{3})*,\d{1,2}$|^\d+,\d{1,2}$/.test(v)) return Number.NaN
    normal = v.replace(/\./g, "").replace(",", ".")
  } else if (/^\d+(\.\d{1,2})?$/.test(v)) {
    normal = v
  } else if (/^\d{1,3}(\.\d{3})+$/.test(v)) {
    normal = v.replace(/\./g, "")
  } else {
    return Number.NaN
  }
  return Math.round(Number(normal) * 100) / 100
}

/** 1234.5 -> "1.234,50" (sem o "R$": ele aparece como prefixo do campo). */
export function moedaParaCampo(valor: number): string {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
