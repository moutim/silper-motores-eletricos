import type { Motor } from "@/lib/types"
import { contextoDaSessao } from "./contexto"
import { preverRastreio } from "./rastreio-service"
import { SheetsMotorRepository } from "./repositories/sheets-motor-repository"
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
