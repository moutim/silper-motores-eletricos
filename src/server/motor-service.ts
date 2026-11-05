import { atualizarMotor, planejarBobinagens } from "@/lib/motor-edicao"
import type { MotorFormValues } from "@/lib/motor-schema"
import { normalizarRastreio } from "@/lib/rastreio"
import type { AcessoRecente, Bobinagem, Motor } from "@/lib/types"

/**
 * Porta de dados da ficha. Há uma implementação sobre o Google Sheets (sheets/porta-dados.ts) e uma
 * em memória nos testes. As linhas nunca se deslocam (as descartadas são esvaziadas), então o número
 * da linha lido continua valendo até a gravação.
 */
export interface PortaDados {
  motores(): Promise<{ linha: number; motor: Motor }[]>
  atualizarMotor(linha: number, motor: Motor): Promise<void>
  bobinagensDe(motorId: string): Promise<{ linha: number; bobinagem: Bobinagem }[]>
  atualizarBobinagem(linha: number, bobinagem: Bobinagem): Promise<void>
  acrescentarBobinagens(bobinagens: Bobinagem[]): Promise<void>
  limparBobinagem(linha: number): Promise<void>
  acessos(): Promise<{ linha: number; acesso: AcessoRecente }[]>
  atualizarAcesso(linha: number, acesso: AcessoRecente): Promise<void>
  acrescentarAcesso(acesso: AcessoRecente): Promise<void>
}

export type ResultadoEdicao =
  | { ok: true }
  | { ok: false; erro: "NAO_ENCONTRADO" | "DESATIVADO" | "CONFLITO" }

interface Contexto {
  usuario: string
  agora: string
}

async function acharMotor(porta: PortaDados, rastreio: string) {
  const chave = normalizarRastreio(rastreio)
  return (await porta.motores()).find((x) => x.motor.rastreioChave === chave) ?? null
}

/**
 * Edita a ficha (3.8). Atualiza só `Motor` e `Bobinagem`, nunca as O.S. (RN-09). Se outra pessoa
 * alterou o motor depois que a tela foi aberta (`versao` = atualizadoEm lido), recusa em vez de
 * sobrescrever em silêncio.
 */
export async function editarMotor(
  porta: PortaDados,
  ctx: Contexto,
  rastreio: string,
  valores: MotorFormValues,
  versao: string,
): Promise<ResultadoEdicao> {
  const alvo = await acharMotor(porta, rastreio)
  if (!alvo) return { ok: false, erro: "NAO_ENCONTRADO" }
  if (!alvo.motor.ativo) return { ok: false, erro: "DESATIVADO" }
  if (alvo.motor.atualizadoEm !== versao) return { ok: false, erro: "CONFLITO" }

  const novo = atualizarMotor(alvo.motor, valores, ctx)
  await porta.atualizarMotor(alvo.linha, novo)

  const plano = planejarBobinagens(await porta.bobinagensDe(novo.id), valores, novo.id, ctx)
  for (const { linha, bobinagem } of plano.atualizar) await porta.atualizarBobinagem(linha, bobinagem)
  if (plano.criar.length) await porta.acrescentarBobinagens(plano.criar)
  for (const linha of plano.descartar) await porta.limparBobinagem(linha)
  return { ok: true }
}

/** Desativar em vez de apagar (RN-17): o histórico e o rastreio continuam ocupados. */
export async function alterarAtivo(
  porta: PortaDados,
  ctx: Contexto,
  rastreio: string,
  ativo: boolean,
): Promise<{ ok: true } | { ok: false; erro: "NAO_ENCONTRADO" }> {
  const alvo = await acharMotor(porta, rastreio)
  if (!alvo) return { ok: false, erro: "NAO_ENCONTRADO" }
  if (alvo.motor.ativo !== ativo) {
    await porta.atualizarMotor(alvo.linha, {
      ...alvo.motor,
      ativo,
      atualizadoEm: ctx.agora,
      atualizadoPor: ctx.usuario,
    })
  }
  return { ok: true }
}

/** "Acessados recentemente": uma linha por (conta, motor); abrir de novo só atualiza o horário. */
export async function registrarAcesso(porta: PortaDados, usuario: string, motorId: string, agora: string) {
  const existente = (await porta.acessos()).find((a) => a.acesso.usuario === usuario && a.acesso.motorId === motorId)
  if (existente) await porta.atualizarAcesso(existente.linha, { ...existente.acesso, acessadoEm: agora })
  else await porta.acrescentarAcesso({ usuario, motorId, acessadoEm: agora })
}
