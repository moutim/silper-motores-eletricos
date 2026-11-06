import { renderizarIconeApp } from "@/lib/app-icon"

// Favicon da aba do navegador: símbolo da Silper em fundo transparente, ocupando quase todo o quadrado.
export const size = { width: 64, height: 64 }
export const contentType = "image/png"

export default function Icon() {
  return renderizarIconeApp(64, { fundo: "transparent", escala: 0.96 })
}
