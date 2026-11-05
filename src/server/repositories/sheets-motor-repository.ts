import type { Bobinagem, Motor } from "@/lib/types"
import type { Planilha } from "../sheets/client"
import { BOBINAGENS, MOTORES } from "../sheets/schema"
import type { MotorRepository } from "./types"

const TTL_MS = 5_000
const cache = new Map<string, { em: number; motores: Motor[] }>()

/** Leitura em cache curto (cota da API do Sheets). Qualquer gravação deve chamar `invalidarCacheMotores`. */
export function invalidarCacheMotores(spreadsheetId: string) {
  cache.delete(spreadsheetId)
}

export class SheetsMotorRepository implements MotorRepository {
  constructor(private readonly planilha: Planilha) {}

  async listar(): Promise<Motor[]> {
    const id = this.planilha.spreadsheetId
    const guardado = cache.get(id)
    if (guardado && Date.now() - guardado.em < TTL_MS) return guardado.motores
    const motores = await this.planilha.ler(MOTORES)
    cache.set(id, { em: Date.now(), motores })
    return motores
  }

  async buscarPorRastreio(rastreio: string): Promise<Motor | null> {
    const chave = rastreio.trim().toLowerCase()
    return (await this.listar()).find((m) => m.rastreioChave === chave) ?? null
  }

  async bobinagensDoMotor(motorId: string): Promise<Bobinagem[]> {
    return (await this.planilha.ler(BOBINAGENS)).filter((b) => b.motorId === motorId)
  }
}
