import { normalizarRastreio } from "@/lib/rastreio"
import type { OrdemServico } from "@/lib/types"
import type { PortaOS } from "../os-service"
import type { Planilha } from "./client"
import { BOBINAGENS, MOTORES, ORDENS_SERVICO } from "./schema"

/** Implementação da porta de O.S. sobre o Google Sheets. */
export class PortaOSSheets implements PortaOS {
  constructor(private readonly planilha: Planilha) {}

  async motorPorRastreio(rastreio: string) {
    const chave = normalizarRastreio(rastreio)
    const motor = (await this.planilha.ler(MOTORES)).find((m) => m.rastreioChave === chave)
    if (!motor) return null
    const bobinagens = (await this.planilha.ler(BOBINAGENS)).filter((b) => b.motorId === motor.id)
    return { motor, bobinagens }
  }

  async acrescentarOS(os: OrdemServico) {
    await this.planilha.acrescentar(ORDENS_SERVICO, [os])
  }

  async buscarOS(id: string) {
    const achada = (await this.planilha.lerLinhas(ORDENS_SERVICO)).find((l) => l.obj.id === id)
    return achada ? { linha: achada.linha, os: achada.obj } : null
  }

  atualizarOS(linha: number, os: OrdemServico) {
    return this.planilha.atualizarLinha(ORDENS_SERVICO, linha, os)
  }
}
