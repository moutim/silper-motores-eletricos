import { config } from "./config"
import { calcularDimensoes } from "./foto"

/**
 * Prepara a foto no navegador (só cliente): corrige a rotação, reduz o lado maior para até 2048 px e
 * gera JPEG. HEIC que o navegador não abre é convertido sob demanda (biblioteca carregada só nesse caso).
 */
export async function prepararImagem(arquivo: File): Promise<{ blob: Blob; largura: number; altura: number }> {
  const abrir = (b: Blob) => createImageBitmap(b, { imageOrientation: "from-image" })
  let bitmap: ImageBitmap
  try {
    bitmap = await abrir(arquivo)
  } catch {
    const ehHeic = /hei[cf]$/i.test(arquivo.name) || /hei[cf]/i.test(arquivo.type)
    if (!ehHeic) throw new Error("Não foi possível abrir essa imagem.")
    try {
      const heic2any = (await import("heic2any")).default
      const saida = await heic2any({ blob: arquivo, toType: "image/jpeg", quality: 0.9 })
      bitmap = await abrir(Array.isArray(saida) ? saida[0] : saida)
    } catch {
      throw new Error("Não foi possível converter a foto HEIC. Envie em JPG ou PNG.")
    }
  }

  const { largura, altura } = calcularDimensoes(bitmap.width, bitmap.height)
  const canvas = document.createElement("canvas")
  canvas.width = largura
  canvas.height = altura
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Este navegador não consegue preparar a foto.")
  ctx.fillStyle = "#fff" // PNG com transparência vira JPEG sobre fundo branco
  ctx.fillRect(0, 0, largura, altura)
  ctx.drawImage(bitmap, 0, 0, largura, altura)
  bitmap.close()

  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", config.fotos.qualidadeJpeg))
  if (!blob) throw new Error("Não foi possível preparar a foto.")
  if (blob.size > config.fotos.tamanhoMaxBytes) throw new Error("A foto é grande demais (máximo de 10 MB).")
  return { blob, largura, altura }
}
