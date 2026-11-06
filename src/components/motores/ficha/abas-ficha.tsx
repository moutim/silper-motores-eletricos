"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import type { Aba } from "@/lib/ficha"
import { EsqueletoPainel } from "./esqueleto-painel"

const ABAS: { valor: Aba; curto: string; longo: string }[] = [
  { valor: "dados", curto: "Dados técnicos", longo: "Dados técnicos" },
  { valor: "os", curto: "O.S.", longo: "Ordens de serviço" },
  { valor: "fotos", curto: "Fotos", longo: "Fotos e esquemas" },
]

const ID_PAINEL = "painel-ficha"

/**
 * Abas da ficha: texto alinhado à esquerda, com traço laranja sob a ativa e uma linha fina de divisão.
 * A aba vive na URL (`?aba=dados|os|fotos`) e o conteúdo vem do servidor (`children`). Ao trocar de aba, a
 * nova ativa é marcada na hora e o painel mostra um esqueleto com brilho até o conteúdo chegar.
 */
export function AbasFicha({ aba, children }: { aba: Aba; children: React.ReactNode }) {
  const router = useRouter()
  const [pendente, comecar] = useTransition()
  const [destino, setDestino] = useState<Aba | null>(null)
  const ativa = pendente && destino ? destino : aba

  function trocar(e: React.MouseEvent<HTMLAnchorElement>, valor: Aba) {
    // Cliques com Ctrl/Cmd/Shift ou do meio seguem o link normal (nova aba do navegador).
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    if (valor === aba) return
    setDestino(valor)
    comecar(() => router.replace(`?aba=${valor}`, { scroll: false }))
  }

  return (
    <>
      <nav
        aria-label="Seções da ficha"
        className="no-scrollbar mt-1 flex gap-5 overflow-x-auto border-b border-separator px-1 md:mt-5 md:gap-7"
      >
        {ABAS.map((a) => {
          const atual = a.valor === ativa
          return (
            <Link
              key={a.valor}
              href={`?aba=${a.valor}`}
              replace
              scroll={false}
              onClick={(e) => trocar(e, a.valor)}
              aria-current={atual ? "page" : undefined}
              aria-controls={ID_PAINEL}
              className={`relative flex min-h-11 shrink-0 items-center rounded-field text-[13px] font-semibold whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring md:text-sm ${
                atual ? "text-primary" : "text-text-tertiary hover:text-text-primary"
              }`}
            >
              <span className="md:hidden">{a.curto}</span>
              <span className="max-md:hidden">{a.longo}</span>
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary transition-opacity ${atual ? "opacity-100" : "opacity-0"}`}
              />
            </Link>
          )
        })}
      </nav>
      <div id={ID_PAINEL} aria-busy={pendente} className="mt-1 md:mt-5">
        {pendente ? <EsqueletoPainel aba={ativa} /> : children}
      </div>
    </>
  )
}
