import { normalizarRastreio } from "@/lib/rastreio"
import type { Foto } from "@/lib/types"
import type { PortaFotos } from "../foto-service"
import type { Planilha } from "./client"
import { FOTOS, MOTORES, ORDENS_SERVICO } from "./schema"

/** Implementação da porta de fotos sobre o Google Sheets. */
export class PortaFotosSheets implements PortaFotos {
  constructor(private readonly planilha: Planilha) {}

  async motorPorRastreio(rastreio: string) {
    const chave = normalizarRastreio(rastreio)
    return (await this.planilha.ler(MOTORES)).find((m) => m.rastreioChave === chave) ?? null
  }

  async motorPorId(id: string) {
    return (await this.planilha.ler(MOTORES)).find((m) => m.id === id) ?? null
  }

  async osPorId(id: string) {
    return (await this.planilha.ler(ORDENS_SERVICO)).find((o) => o.id === id) ?? null
  }

  async fotosDoMotor(motorId: string) {
    return (await this.planilha.ler(FOTOS)).filter((f) => f.motorId === motorId)
  }

  async acrescentarFoto(foto: Foto) {
    await this.planilha.acrescentar(FOTOS, [foto])
  }

  async buscarFoto(id: string) {
    const achada = (await this.planilha.lerLinhas(FOTOS)).find((l) => l.obj.id === id)
    return achada ? { linha: achada.linha, foto: achada.obj } : null
  }

  limparFoto(linha: number) {
    return this.planilha.limparLinha(FOTOS as never, linha)
  }
}
