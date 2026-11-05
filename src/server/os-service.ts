import { atualizarOS, montarOS } from "@/lib/os-mapper"
import type { OSFormValues } from "@/lib/os-schema"
import { normalizarRastreio } from "@/lib/rastreio"
import type { Bobinagem, Motor, OrdemServico } from "@/lib/types"

/**
 * Porta de dados das O.S. Há uma implementação sobre o Google Sheets (sheets/porta-os.ts) e uma em
 * memória nos testes.
 */
export interface PortaOS {
  motorPorRastreio(rastreio: string): Promise<{ motor: Motor; bobinagens: Bobinagem[] } | null>
  acrescentarOS(os: OrdemServico): Promise<void>
  buscarOS(id: string): Promise<{ linha: number; os: OrdemServico } | null>
  atualizarOS(linha: number, os: OrdemServico): Promise<void>
}

interface Contexto {
  usuario: string
  agora: string
}

export type ResultadoCriacaoOS =
  | { ok: true; os: OrdemServico }
  | { ok: false; erro: "MOTOR_NAO_ENCONTRADO" | "MOTOR_DESATIVADO" }

/**
 * Abre uma O.S. no motor. O número é digitado e NÃO é verificado quanto a duplicidade (RN-07, RN-08);
 * duas O.S. "4310" são dois registros com `id` diferentes. Grava o retrato dos dados técnicos (RN-18).
 */
export async function criarOS(
  porta: PortaOS,
  ctx: Contexto,
  rastreio: string,
  valores: OSFormValues,
): Promise<ResultadoCriacaoOS> {
  const alvo = await porta.motorPorRastreio(normalizarRastreio(rastreio))
  if (!alvo) return { ok: false, erro: "MOTOR_NAO_ENCONTRADO" }
  if (!alvo.motor.ativo) return { ok: false, erro: "MOTOR_DESATIVADO" }
  const os = montarOS(valores, alvo.motor, alvo.bobinagens, ctx)
  await porta.acrescentarOS(os)
  return { ok: true, os }
}

export type ResultadoEdicaoOS =
  | { ok: true }
  | { ok: false; erro: "NAO_ENCONTRADA" | "MOTOR_DESATIVADO" | "CONFLITO" }

/**
 * Edita a O.S. O retrato não é refeito (RN-09, RN-18). Recusa se outra pessoa alterou a O.S. depois que
 * a tela abriu (`versao` = atualizadoEm lido).
 */
export async function editarOS(
  porta: PortaOS,
  ctx: Contexto,
  id: string,
  valores: OSFormValues,
  versao: string,
  rastreioDoMotor: (motorId: string) => Promise<Motor | null>,
): Promise<ResultadoEdicaoOS> {
  const achada = await porta.buscarOS(id)
  if (!achada) return { ok: false, erro: "NAO_ENCONTRADA" }
  const motor = await rastreioDoMotor(achada.os.motorId)
  if (motor && !motor.ativo) return { ok: false, erro: "MOTOR_DESATIVADO" }
  if (achada.os.atualizadoEm !== versao) return { ok: false, erro: "CONFLITO" }
  await porta.atualizarOS(achada.linha, atualizarOS(achada.os, valores, ctx))
  return { ok: true }
}
