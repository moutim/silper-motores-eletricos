/** Seções do menu (doc 02, seção 6.2). A aba ativa corresponde à seção da tela. */
export type Secao = "inicio" | "motores" | "os"

export const ITENS_MENU: readonly { secao: Secao; href: string; rotulo: string }[] = [
  { secao: "inicio", href: "/", rotulo: "Início" },
  { secao: "motores", href: "/motores", rotulo: "Motores" },
  { secao: "os", href: "/os", rotulo: "O.S." },
]

/**
 * Qual aba fica ativa para uma rota. A ficha do motor pertence a Motores; a O.S. aberta pertence
 * a O.S.; o destino do QR (/m/...) leva à ficha, então também é Motores.
 */
export function secaoAtiva(pathname: string): Secao | null {
  if (pathname === "/") return "inicio"
  const primeiro = pathname.split("/")[1]
  if (primeiro === "motores" || primeiro === "m") return "motores"
  if (primeiro === "os") return "os"
  return null
}
