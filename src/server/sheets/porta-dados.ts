import type { AcessoRecente, Bobinagem, Motor } from "@/lib/types"
import type { PortaDados } from "../motor-service"
import type { Planilha } from "./client"
import { ACESSOS_RECENTES, BOBINAGENS, MOTORES } from "./schema"

/** Implementação da porta de dados da ficha sobre o Google Sheets. */
export class PortaDadosSheets implements PortaDados {
  constructor(private readonly planilha: Planilha) {}

  async motores() {
    return (await this.planilha.lerLinhas(MOTORES)).map(({ linha, obj }) => ({ linha, motor: obj as Motor }))
  }

  atualizarMotor(linha: number, motor: Motor) {
    return this.planilha.atualizarLinha(MOTORES, linha, motor)
  }

  async bobinagensDe(motorId: string) {
    return (await this.planilha.lerLinhas(BOBINAGENS))
      .filter(({ obj }) => obj.motorId === motorId)
      .map(({ linha, obj }) => ({ linha, bobinagem: obj as Bobinagem }))
  }

  atualizarBobinagem(linha: number, bobinagem: Bobinagem) {
    return this.planilha.atualizarLinha(BOBINAGENS, linha, bobinagem)
  }

  async acrescentarBobinagens(bobinagens: Bobinagem[]) {
    await this.planilha.acrescentar(BOBINAGENS, bobinagens)
  }

  limparBobinagem(linha: number) {
    return this.planilha.limparLinha(BOBINAGENS as never, linha)
  }

  async acessos() {
    return (await this.planilha.lerLinhas(ACESSOS_RECENTES)).map(({ linha, obj }) => ({
      linha,
      acesso: obj as AcessoRecente,
    }))
  }

  atualizarAcesso(linha: number, acesso: AcessoRecente) {
    return this.planilha.atualizarLinha(ACESSOS_RECENTES, linha, acesso)
  }

  async acrescentarAcesso(acesso: AcessoRecente) {
    await this.planilha.acrescentar(ACESSOS_RECENTES, [acesso])
  }
}
