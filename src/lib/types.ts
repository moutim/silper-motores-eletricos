/** Tipos de domínio (doc 01, seção 4). Datas "só dia" são "AAAA-MM-DD"; instantes são ISO 8601. */

export type RastreioOrigem = "AUTOMATICO" | "MANUAL"
export type PotenciaUnidade = "CV" | "HP" | "KW"
export type TipoMotor = "MONOFASICO" | "TRIFASICO"
export type FuncaoBobina = "UNICA" | "TRABALHO" | "AUXILIAR"
export type Ligacao = "SERIE" | "PARALELO"
export type Camada = "UNICA" | "DUPLA"
export type TipoFoto = "EQUIPAMENTO" | "ESQUEMA" | "SERVICO"

export interface Auditoria {
  criadoEm: string
  atualizadoEm: string
  criadoPor: string | null
  atualizadoPor: string | null
}

export interface Motor extends Auditoria {
  id: string
  rastreio: string
  /** rastreio sem espaços nas pontas e em minúsculas: a chave de unicidade (RN-02, RN-04). */
  rastreioChave: string
  rastreioOrigem: RastreioOrigem
  clienteNome: string
  marca: string | null
  modelo: string | null
  tipoEquipamento: string | null
  potenciaValor: number | null
  potenciaUnidade: PotenciaUnidade | null
  tensao: string | null
  corrente: string | null
  rpm: string | null
  fatorServico: string | null
  item: string | null
  pacote: string | null
  diametro: string | null
  tipoMotor: TipoMotor
  ativo: boolean
  modeloOrigemId: string | null
}

export interface Bobinagem extends Auditoria {
  id: string
  motorId: string
  funcao: FuncaoBobina
  passo: string | null
  voltas: number | null
  fio: string | null
  ligacao: Ligacao | null
  camada: Camada | null
}

/** Cópia dos dados técnicos na abertura da O.S. (RN-18). */
export interface RetratoTecnico {
  motor: Pick<
    Motor,
    | "marca" | "modelo" | "tipoEquipamento" | "potenciaValor" | "potenciaUnidade"
    | "tensao" | "corrente" | "rpm" | "fatorServico" | "item" | "pacote" | "diametro" | "tipoMotor"
  >
  bobinagens: Pick<Bobinagem, "funcao" | "passo" | "voltas" | "fio" | "ligacao" | "camada">[]
}

export interface OrdemServico extends Auditoria {
  id: string
  motorId: string
  /** Digitado pelo usuário. NÃO é único (RN-07, RN-08): identificar sempre por `id`. */
  numero: string
  dataEntrada: string
  defeito: string | null
  servicoExecutado: string | null
  observacoes: string | null
  valorNota: number | null
  retratoTecnico: RetratoTecnico
}

export interface Foto extends Auditoria {
  id: string
  motorId: string
  osId: string | null
  tipo: TipoFoto
  /** Id do arquivo no armazenamento (Drive). */
  chaveArmazenamento: string
  mime: string
  tamanhoBytes: number
  largura: number | null
  altura: number | null
}

export interface AcessoRecente {
  usuario: string
  motorId: string
  acessadoEm: string
}

export interface SequenciaRastreio {
  prefixo: string
  ultimoNumero: number
}
