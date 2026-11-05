/** Serviço de armazenamento de fotos. Implementação atual: Google Drive da conta (storage/drive.ts). */
export interface ArmazenamentoFotos {
  /** Guarda o arquivo e devolve a chave (no Drive, o id do arquivo). */
  enviar(arquivo: { nome: string; mime: string; dados: Buffer }): Promise<{ chave: string }>
  ler(chave: string): Promise<Buffer>
  /** Tira o arquivo de uso. No Drive vai para a lixeira (recuperável), não é apagado de vez. */
  remover(chave: string): Promise<void>
}
