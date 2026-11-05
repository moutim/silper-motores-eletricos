import type { Bobinagem, Motor } from "@/lib/types"
import { contextoDaSessao } from "./contexto"
import { registrarAcesso } from "./motor-service"
import { preverRastreio } from "./rastreio-service"
import { SheetsMotorRepository } from "./repositories/sheets-motor-repository"
import { PortaDadosSheets } from "./sheets/porta-dados"
import { PortaMotoresSheets } from "./sheets/porta-motores"

/** Consultas usadas pelas telas (servidor). Nenhuma regra de negócio aqui: elas ficam em lib/ e nos serviços. */

export async function previsaoDoProximoRastreio(): Promise<string> {
  const { planilha } = await contextoDaSessao()
  return preverRastreio(new PortaMotoresSheets(planilha))
}

/** Motores ativos, do mais recente para o mais antigo. */
export async function listarMotoresAtivos(): Promise<Motor[]> {
  const { planilha } = await contextoDaSessao()
  const motores = await new SheetsMotorRepository(planilha).listar()
  return motores.filter((m) => m.ativo).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
}

/** Motor (ativo ou não) e suas bobinagens pelo rastreio da URL; `null` se não existir. */
export async function carregarFicha(
  rastreio: string,
): Promise<{ motor: Motor; bobinagens: Bobinagem[]; usuario: string; planilha: Awaited<ReturnType<typeof contextoDaSessao>>["planilha"] } | null> {
  const { planilha, usuario } = await contextoDaSessao()
  const repo = new SheetsMotorRepository(planilha)
  const motor = await repo.buscarPorRastreio(decodeURIComponent(rastreio))
  if (!motor) return null
  return { motor, bobinagens: await repo.bobinagensDoMotor(motor.id), usuario, planilha }
}

/** Grava o acesso recente (depois de responder; falha aqui nunca derruba a ficha). */
export async function gravarAcessoRecente(
  planilha: Awaited<ReturnType<typeof contextoDaSessao>>["planilha"],
  usuario: string,
  motorId: string,
) {
  try {
    await registrarAcesso(new PortaDadosSheets(planilha), usuario, motorId, new Date().toISOString())
  } catch (e) {
    console.error("[acesso recente]", e)
  }
}
