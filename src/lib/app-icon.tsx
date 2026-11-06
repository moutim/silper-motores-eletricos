import { readFile } from "node:fs/promises"
import path from "node:path"
import { ImageResponse } from "next/og"

/** Tamanhos PNG do manifest: o Android exige 192 e 512 para oferecer a instalação. */
export const TAMANHOS_ICONE_PWA = [192, 512] as const

/**
 * Ícone do app: símbolo da Silper sobre fundo branco, usado no iPhone (apple-icon) e no manifest.
 * O desenho ocupa ~60% da largura, dentro da área segura dos ícones "maskable". `fundo` e `escala` servem ao favicon
 * (fundo transparente e símbolo maior, porque na aba do navegador o ícone é minúsculo).
 */
export async function renderizarIconeApp(tamanho: number, opcoes: { fundo?: string; escala?: number } = {}) {
  const { fundo = "#FFFFFF", escala = 0.6 } = opcoes
  const svg = await readFile(path.join(process.cwd(), "public/assets/silper-icone.svg"))
  const src = `data:image/svg+xml;base64,${svg.toString("base64")}`
  const largura = Math.round(tamanho * escala)
  const altura = Math.round(largura * (322 / 490))

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: fundo }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={largura} height={altura} alt="" />
      </div>
    ),
    { width: tamanho, height: tamanho },
  )
}
