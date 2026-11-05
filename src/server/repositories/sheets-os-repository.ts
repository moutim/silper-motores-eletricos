import { ordenarOS } from "@/lib/os-ordem"
import type { OrdemServico } from "@/lib/types"
import type { Planilha } from "../sheets/client"
import { ORDENS_SERVICO } from "../sheets/schema"
import type { OrdemServicoRepository } from "./types"

const TTL_MS = 5_000
const cache = new Map<string, { em: number; ordens: OrdemServico[] }>()

/** Leitura em cache curto (cota da API do Sheets). Qualquer gravação deve chamar `invalidarCacheOS`. */
export function invalidarCacheOS(spreadsheetId: string) {
  cache.delete(spreadsheetId)
}

export class SheetsOSRepository implements OrdemServicoRepository {
  constructor(private readonly planilha: Planilha) {}

  async listar(): Promise<OrdemServico[]> {
    const id = this.planilha.spreadsheetId
    const guardado = cache.get(id)
    if (guardado && Date.now() - guardado.em < TTL_MS) return guardado.ordens
    const ordens = await this.planilha.ler(ORDENS_SERVICO)
    cache.set(id, { em: Date.now(), ordens })
    return ordens
  }

  /** Mais recente primeiro. */
  async doMotor(motorId: string): Promise<OrdemServico[]> {
    return ordenarOS((await this.listar()).filter((o) => o.motorId === motorId))
  }

  async buscarPorId(id: string): Promise<OrdemServico | null> {
    return (await this.listar()).find((o) => o.id === id) ?? null
  }
}
