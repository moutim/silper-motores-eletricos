import { config } from "./config"

/** Chave de comparação: sem espaços nas pontas e sem diferenciar maiúsculas (doc 01, 5.4). */
export function normalizarRastreio(valor: string): string {
  return valor.trim().toLowerCase()
}

export type ResultadoRastreio = { ok: true; valor: string } | { ok: false; erro: string }

/** Valida um rastreio digitado. Não verifica duplicidade: isso é do servidor. */
export function validarRastreioDigitado(entrada: string): ResultadoRastreio {
  const valor = entrada.trim()
  const { tamanhoMin, tamanhoMax, padraoDigitado } = config.rastreio
  if (valor.length < tamanhoMin || valor.length > tamanhoMax) {
    return { ok: false, erro: `Use de ${tamanhoMin} a ${tamanhoMax} caracteres.` }
  }
  if (!padraoDigitado.test(valor)) {
    return { ok: false, erro: "Use só letras, números e os símbolos - _ ." }
  }
  return { ok: true, valor }
}

export function formatarRastreio(
  numero: number,
  prefixo: string = config.rastreio.prefixo,
  digitos: number = config.rastreio.digitos,
): string {
  return `${prefixo}${String(numero).padStart(digitos, "0")}`
}

/** Mensagem padrão de duplicado (doc 01, 5.4). */
export function mensagemRastreioEmUso(valor: string): string {
  return `${valor} já está em uso por outro motor. Digite outro número.`
}

/**
 * Próximo número automático: maior entre a sequência e o maior número já ocupado com o mesmo
 * prefixo (inclusive por rastreio digitado ou motor desativado), mais um. Nunca reutiliza.
 */
export function proximoNumeroRastreio(
  ultimoDaSequencia: number,
  rastreiosOcupados: Iterable<string>,
  prefixo: string = config.rastreio.prefixo,
): number {
  const chavePrefixo = normalizarRastreio(prefixo)
  let maior = ultimoDaSequencia
  for (const r of rastreiosOcupados) {
    const chave = normalizarRastreio(r)
    if (!chave.startsWith(chavePrefixo)) continue
    const resto = chave.slice(chavePrefixo.length)
    if (/^\d+$/.test(resto)) maior = Math.max(maior, Number(resto))
  }
  return maior + 1
}
