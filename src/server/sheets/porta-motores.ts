import type { Bobinagem, Motor } from "@/lib/types"
import type { PortaMotores } from "../rastreio-service"
import type { Planilha } from "./client"
import { BOBINAGENS, MOTORES, SEQUENCIA_RASTREIO } from "./schema"

/** Implementação da porta de motores sobre a planilha do Google Sheets. */
export class PortaMotoresSheets implements PortaMotores {
  constructor(private readonly planilha: Planilha) {}

  lerChaves() {
    return this.planilha.lerColuna(MOTORES, "rastreioChave")
  }

  async acrescentarMotor(motor: Motor) {
    return { linha: await this.planilha.acrescentar(MOTORES, [motor]) }
  }

  limparLinhaMotor(linha: number) {
    return this.planilha.limparLinha(MOTORES as never, linha)
  }

  async acrescentarBobinagens(bobinagens: Bobinagem[]) {
    await this.planilha.acrescentar(BOBINAGENS, bobinagens)
  }

  async ultimoDaSequencia(prefixo: string) {
    const linhas = await this.planilha.ler(SEQUENCIA_RASTREIO)
    return linhas.find((l) => l.prefixo === prefixo)?.ultimoNumero ?? 0
  }

  async gravarSequencia(prefixo: string, numero: number) {
    const prefixos = await this.planilha.lerColuna(SEQUENCIA_RASTREIO, "prefixo")
    const i = prefixos.findIndex((p) => p === prefixo)
    if (i === -1) {
      await this.planilha.acrescentar(SEQUENCIA_RASTREIO, [{ prefixo, ultimoNumero: numero }])
      return
    }
    const atual = await this.ultimoDaSequencia(prefixo)
    if (numero > atual) await this.planilha.atualizarCelula(SEQUENCIA_RASTREIO, "ultimoNumero", i + 2, numero)
  }
}
