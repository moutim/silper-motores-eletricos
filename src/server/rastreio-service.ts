import { formatarRastreio, normalizarRastreio, proximoNumeroRastreio } from "@/lib/rastreio"
import { config } from "@/lib/config"
import type { Bobinagem, Motor, RastreioOrigem } from "@/lib/types"

/**
 * Porta mínima que o serviço de rastreio precisa. Há uma implementação sobre o Google Sheets
 * (sheets/porta-motores.ts) e uma em memória nos testes.
 */
export interface PortaMotores {
  /** `rastreioChave` de cada linha de motor, na ordem das linhas (índice i = linha i + 2). Vazio = linha limpa. */
  lerChaves(): Promise<string[]>
  /** Acrescenta ao fim e devolve a linha (1-based) em que o motor ficou. */
  acrescentarMotor(motor: Motor): Promise<{ linha: number }>
  limparLinhaMotor(linha: number): Promise<void>
  acrescentarBobinagens(bobinagens: Bobinagem[]): Promise<void>
  ultimoDaSequencia(prefixo: string): Promise<number>
  gravarSequencia(prefixo: string, numero: number): Promise<void>
}

export type Montar = (rastreio: string, origem: RastreioOrigem) => { motor: Motor; bobinagens: Bobinagem[] }
export type ResultadoCriacao = { ok: true; motor: Motor } | { ok: false; erro: "RASTREIO_EM_USO" }

const MAX_TENTATIVAS_AUTOMATICO = 8

/**
 * "Gravar e reler" (docs/DECISOES.md, D-04). O Sheets não tem restrição única nem transação, então:
 * grava a linha, relê a coluna do rastreio e vale a linha de menor posição. Quem perdeu limpa a
 * própria linha. O append é atômico, então isso vale também com várias instâncias do servidor.
 */
async function gravarSePrimeiro(
  porta: PortaMotores,
  rastreio: string,
  origem: RastreioOrigem,
  montar: Montar,
): Promise<ResultadoCriacao> {
  const chave = normalizarRastreio(rastreio)
  const { motor, bobinagens } = montar(rastreio, origem)
  const { linha } = await porta.acrescentarMotor(motor)

  let primeiro = -1
  for (let leitura = 0; leitura < 3 && primeiro === -1; leitura++) {
    const chaves = await porta.lerChaves()
    primeiro = chaves.findIndex((c) => normalizarRastreio(c) === chave)
  }
  if (primeiro === -1) throw new Error("Não foi possível confirmar o rastreio gravado.")

  if (primeiro !== linha - 2) {
    await porta.limparLinhaMotor(linha)
    return { ok: false, erro: "RASTREIO_EM_USO" }
  }

  try {
    await porta.acrescentarBobinagens(bobinagens)
  } catch (e) {
    await porta.limparLinhaMotor(linha)
    throw e
  }
  return { ok: true, motor }
}

/** Número que a tela mostra como previsão do próximo rastreio automático. */
export async function preverRastreio(porta: PortaMotores): Promise<string> {
  const { prefixo, digitos } = config.rastreio
  const [chaves, ultimo] = await Promise.all([porta.lerChaves(), porta.ultimoDaSequencia(prefixo)])
  return formatarRastreio(proximoNumeroRastreio(ultimo, chaves, prefixo), prefixo, digitos)
}

export async function rastreioOcupado(porta: PortaMotores, rastreio: string): Promise<boolean> {
  const chave = normalizarRastreio(rastreio)
  return (await porta.lerChaves()).some((c) => normalizarRastreio(c) === chave)
}

export async function criarMotor(
  porta: PortaMotores,
  pedido: { modo: "AUTOMATICO"; montar: Montar } | { modo: "MANUAL"; digitado: string; montar: Montar },
): Promise<ResultadoCriacao> {
  if (pedido.modo === "MANUAL") {
    if (await rastreioOcupado(porta, pedido.digitado)) return { ok: false, erro: "RASTREIO_EM_USO" }
    return gravarSePrimeiro(porta, pedido.digitado.trim(), "MANUAL", pedido.montar)
  }

  const { prefixo, digitos } = config.rastreio
  for (let tentativa = 0; tentativa < MAX_TENTATIVAS_AUTOMATICO; tentativa++) {
    const [chaves, ultimo] = await Promise.all([porta.lerChaves(), porta.ultimoDaSequencia(prefixo)])
    const numero = proximoNumeroRastreio(ultimo, chaves, prefixo)
    const r = await gravarSePrimeiro(porta, formatarRastreio(numero, prefixo, digitos), "AUTOMATICO", pedido.montar)
    if (r.ok) {
      // O piso da sequência impede reutilizar um número se uma linha for apagada à mão na planilha.
      await porta.gravarSequencia(prefixo, numero).catch(() => undefined)
      return r
    }
  }
  throw new Error("Muitos cadastros ao mesmo tempo. Tente de novo.")
}
