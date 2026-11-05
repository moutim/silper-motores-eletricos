import { config } from "./config"
import { ordenarOS } from "./os-ordem"
import type { Foto, OrdemServico, TipoFoto } from "./types"

export type MimeImagem = "image/jpeg" | "image/png" | "image/webp" | "image/heic"

const MARCAS_HEIC = ["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs", "mif1", "msf1"]
const texto = (b: Uint8Array, de: number, ate: number) => String.fromCharCode(...b.slice(de, ate))

/** Tipo real da imagem pelos primeiros bytes (não confia no nome nem no tipo informado pelo navegador). */
export function detectarTipoImagem(b: Uint8Array): MimeImagem | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg"
  if (b.length >= 8 && b[0] === 0x89 && texto(b, 1, 4) === "PNG" && b[4] === 0x0d && b[5] === 0x0a) return "image/png"
  if (b.length >= 12 && texto(b, 0, 4) === "RIFF" && texto(b, 8, 12) === "WEBP") return "image/webp"
  if (b.length >= 12 && texto(b, 4, 8) === "ftyp" && MARCAS_HEIC.includes(texto(b, 8, 12))) return "image/heic"
  return null
}

/** Reduz mantendo a proporção: o lado maior fica no máximo em `max`; nunca amplia. */
export function calcularDimensoes(largura: number, altura: number, max: number = config.fotos.ladoMaxPx) {
  const maior = Math.max(largura, altura)
  if (maior <= max) return { largura, altura }
  const f = max / maior
  return { largura: Math.round(largura * f), altura: Math.round(altura * f) }
}

export type ErroFoto =
  | "TIPO_INVALIDO"
  | "TAMANHO_EXCEDIDO"
  | "LIMITE_MOTOR"
  | "LIMITE_OS"
  | "TIPO_INCOERENTE"
  | "OS_DE_OUTRO_MOTOR"
  | "MOTOR_DESATIVADO"

export const MENSAGEM_ERRO_FOTO: Record<ErroFoto | "MOTOR_NAO_ENCONTRADO" | "OS_NAO_ENCONTRADA" | "FOTO_NAO_ENCONTRADA", string> = {
  TIPO_INVALIDO: "Esse arquivo não é uma imagem aceita (JPG, PNG, WebP ou HEIC).",
  TAMANHO_EXCEDIDO: "A foto é grande demais (máximo de 10 MB). Tente uma menor.",
  LIMITE_MOTOR: "Este motor já tem o máximo de fotos.",
  LIMITE_OS: "Esta O.S. já tem o máximo de fotos.",
  TIPO_INCOERENTE: "Foto de serviço precisa de uma O.S.; foto do equipamento e do esquema ficam no motor.",
  OS_DE_OUTRO_MOTOR: "Essa O.S. não pertence a este motor.",
  MOTOR_DESATIVADO: "Este motor está desativado. Reative para enviar ou excluir fotos.",
  MOTOR_NAO_ENCONTRADO: "Motor não encontrado.",
  OS_NAO_ENCONTRADA: "O.S. não encontrada.",
  FOTO_NAO_ENCONTRADA: "Foto não encontrada.",
}

/**
 * Regras do envio (RN-11): foto do equipamento e do esquema ficam no motor, sem O.S.; foto de serviço
 * exige uma O.S. do mesmo motor. Também confere tipo real, tamanho e limites de quantidade.
 */
export function validarEnvioFoto(p: {
  tipo: TipoFoto
  osId: string | null
  osDoMotorId?: string | null
  motorId: string
  motorAtivo: boolean
  mimeReal: MimeImagem | null
  tamanhoBytes: number
  fotosDoMotor: number
  fotosDaOS: number
}): ErroFoto | null {
  if (!p.motorAtivo) return "MOTOR_DESATIVADO"
  if (!p.mimeReal || !config.fotos.mimesAceitos.includes(p.mimeReal)) return "TIPO_INVALIDO"
  if (p.tamanhoBytes > config.fotos.tamanhoMaxBytes) return "TAMANHO_EXCEDIDO"
  if ((p.tipo === "SERVICO") !== (p.osId !== null)) return "TIPO_INCOERENTE"
  if (p.osId !== null) {
    if (p.osDoMotorId !== p.motorId) return "OS_DE_OUTRO_MOTOR"
    if (config.fotos.maxPorOS !== null && p.fotosDaOS >= config.fotos.maxPorOS) return "LIMITE_OS"
  } else if (config.fotos.maxPorMotor !== null && p.fotosDoMotor >= config.fotos.maxPorMotor) {
    return "LIMITE_MOTOR"
  }
  return null
}

export interface FotosAgrupadas {
  motor: { equipamento: Foto[]; esquema: Foto[] }
  porOS: { os: OrdemServico; fotos: Foto[] }[]
}

const maisRecenteDepois = (a: Foto, b: Foto) => a.criadoEm.localeCompare(b.criadoEm)

/**
 * Agrupa as fotos de um motor (3.7, RN-11). Foto com O.S. fica na seção da O.S. e nunca aparece como
 * foto do motor. Foto sem O.S. só entra se for do equipamento ou do esquema. Seções de O.S. na ordem
 * do histórico (mais recente primeiro); só aparecem O.S. que têm foto.
 */
export function agruparFotos(fotos: Foto[], ordens: OrdemServico[]): FotosAgrupadas {
  const doMotor = fotos.filter((f) => f.osId === null)
  return {
    motor: {
      equipamento: doMotor.filter((f) => f.tipo === "EQUIPAMENTO").sort(maisRecenteDepois),
      esquema: doMotor.filter((f) => f.tipo === "ESQUEMA").sort(maisRecenteDepois),
    },
    porOS: ordenarOS(ordens)
      .map((os) => ({ os, fotos: fotos.filter((f) => f.osId === os.id).sort(maisRecenteDepois) }))
      .filter((g) => g.fotos.length > 0),
  }
}

export const ROTULO_TIPO_FOTO: Record<TipoFoto, string> = {
  EQUIPAMENTO: "Foto do equipamento",
  ESQUEMA: "Esquema de ligação",
  SERVICO: "Foto de serviço",
}
