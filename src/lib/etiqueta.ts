import QRCode from "qrcode"

/** Margem de silêncio do QR, em módulos (doc 01, 5.7.1). */
export const MARGEM_QR = 4

/** Conteúdo do QR: `{APP_URL}/m/{rastreio}` (RN-19). O rastreio é codificado para a URL. */
export function urlDaEtiqueta(appUrl: string, rastreio: string): string {
  return `${appUrl.trim().replace(/\/+$/, "")}/m/${encodeURIComponent(rastreio.trim())}`
}

export interface QrDesenho {
  /** Lado, em módulos, já com a margem de silêncio. */
  lado: number
  /** Caminho SVG (um quadrado 1×1 por módulo preto), no sistema de coordenadas de `lado`. */
  caminho: string
}

/** QR com correção de erro nível M. Módulos pretos sobre fundo branco; o fundo e a margem ficam por conta de quem desenha. */
export function desenharQr(texto: string): QrDesenho {
  const qr = QRCode.create(texto, { errorCorrectionLevel: "M" })
  const n = qr.modules.size
  let caminho = ""
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (qr.modules.get(y, x)) caminho += `M${x + MARGEM_QR} ${y + MARGEM_QR}h1v1h-1z`
    }
  }
  return { lado: n + MARGEM_QR * 2, caminho }
}
