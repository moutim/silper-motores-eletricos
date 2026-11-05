import type { Bobinagem, Motor, OrdemServico } from "@/lib/types"

/**
 * Camada de dados: o app só conhece estas interfaces. Hoje há uma implementação sobre o Google
 * Sheets; trocar por Postgres (ou outro) é escrever outra implementação. As regras de negócio
 * (rastreio único, retrato, faturamento) ficam em src/lib e nos serviços do servidor.
 * Os métodos entram fase a fase (doc 04, seção 6).
 */
export interface MotorRepository {
  listar(): Promise<Motor[]>
  buscarPorRastreio(rastreio: string): Promise<Motor | null>
  bobinagensDoMotor(motorId: string): Promise<Bobinagem[]>
}

export interface OrdemServicoRepository {
  listar(): Promise<OrdemServico[]>
  doMotor(motorId: string): Promise<OrdemServico[]>
  buscarPorId(id: string): Promise<OrdemServico | null>
}
