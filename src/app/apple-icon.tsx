import { renderizarIconeApp } from "@/lib/app-icon"

// Ícone da tela de início do iPhone (180 px)
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return renderizarIconeApp(180, { escala: 0.8 })
}
