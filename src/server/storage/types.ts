/** Serviço de armazenamento de fotos (Fase 5). Implementação prevista: Google Drive. */
export interface ArmazenamentoFotos {
  enviar(arquivo: { nome: string; mime: string; dados: Buffer }): Promise<{ chave: string }>
  ler(chave: string): Promise<{ mime: string; dados: Buffer }>
  remover(chave: string): Promise<void>
}
