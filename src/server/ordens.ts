import type { Bobinagem, Motor, OrdemServico } from "@/lib/types"
import { contextoDaSessao } from "./contexto"
import { SheetsMotorRepository } from "./repositories/sheets-motor-repository"
import { SheetsOSRepository } from "./repositories/sheets-os-repository"

/** Consultas de O.S. usadas pelas telas (servidor). */

export async function listarOSDoMotor(motorId: string): Promise<OrdemServico[]> {
  const { planilha } = await contextoDaSessao()
  return new SheetsOSRepository(planilha).doMotor(motorId)
}

/** A O.S. com o motor e as bobinagens de hoje (para comparar com o retrato). `null` se não existir. */
export async function carregarOS(
  id: string,
): Promise<{ os: OrdemServico; motor: Motor; bobinagensAtuais: Bobinagem[] } | null> {
  const { planilha } = await contextoDaSessao()
  const os = await new SheetsOSRepository(planilha).buscarPorId(id)
  if (!os) return null
  const motores = new SheetsMotorRepository(planilha)
  const motor = (await motores.listar()).find((m) => m.id === os.motorId)
  if (!motor) return null
  return { os, motor, bobinagensAtuais: await motores.bobinagensDoMotor(motor.id) }
}
