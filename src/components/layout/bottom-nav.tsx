"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ITENS_MENU, secaoAtiva } from "@/lib/navegacao"
import { ICONES_MENU } from "./sidebar-app"

/**
 * Menu de baixo do celular (componente próprio, doc 02, seção 5): cápsula flutuante de 58 px, a 7 px
 * do fundo e 22 px das laterais, vidro translúcido. É o único lugar do app com sombra.
 */
export function BottomNav() {
  const ativa = secaoAtiva(usePathname())

  return (
    <nav
      aria-label="Menu principal"
      className="fixed inset-x-[22px] bottom-[max(7px,env(safe-area-inset-bottom))] z-40 flex h-[58px] items-center rounded-pill border border-separator-subtle bg-surface-glass px-2 shadow-[0_8px_24px_rgba(0,0,0,.12)] backdrop-blur-xl backdrop-saturate-200 md:hidden"
    >
      {ITENS_MENU.map(({ secao, href, rotulo }) => {
        const Icone = ICONES_MENU[secao]
        const ativo = ativa === secao
        return (
          <Link
            key={secao}
            href={href}
            aria-current={ativo ? "page" : undefined}
            className={`flex h-full flex-1 flex-col items-center justify-center gap-0.5 rounded-pill outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              ativo ? "text-orange-text" : "text-text-tertiary"
            }`}
          >
            <Icone size={24} aria-hidden />
            <span className="text-[10px] font-semibold leading-none">{rotulo}</span>
          </Link>
        )
      })}
    </nav>
  )
}
