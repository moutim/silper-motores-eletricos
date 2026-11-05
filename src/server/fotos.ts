import type { Foto } from "@/lib/types"
import { contextoDaSessao } from "./contexto"
import { PortaFotosSheets } from "./sheets/porta-fotos"

/** Fotos de um motor (do motor e das O.S.), para as telas (servidor). */
export async function listarFotosDoMotor(motorId: string): Promise<Foto[]> {
  const { planilha } = await contextoDaSessao()
  return new PortaFotosSheets(planilha).fotosDoMotor(motorId)
}
