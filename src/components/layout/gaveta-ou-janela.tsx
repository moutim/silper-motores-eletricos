"use client"

import { XIcon } from "@phosphor-icons/react"
import type * as React from "react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"

interface Props {
  titulo: string
  descricao: string
  /** Chamado ao fechar (X, Esc, clique fora ou arrastar a gaveta). */
  aoFechar: () => void
  /** Barra de ações: fixa embaixo na gaveta; no rodapé, à direita, na janela. */
  rodape: React.ReactNode
  /** Largura da janela no desktop (940 px nos cadastros, 600 px na Nova O.S.). A altura é fixa para o rodapé não pular quando o conteúdo muda. */
  larguraJanela?: number
  children: React.ReactNode
}

function BotaoX({ rotulo = "Fechar" }: { rotulo?: string }) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-fill text-text-tertiary outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <XIcon size={16} weight="bold" aria-hidden="true" />
    </button>
  )
}

const classeTitulo = "text-[21px] font-bold leading-[1.15] tracking-[-0.02em] md:text-2xl"

/**
 * Tudo o que adiciona ou edita abre por cima da tela (doc 02, 6.3): gaveta no celular, janela no
 * desktop, com X cinza no canto do título.
 */
export function GavetaOuJanela({ titulo, descricao, aoFechar, rodape, larguraJanela = 940, children }: Props) {
  const celular = useIsMobile()
  const aoMudar = (aberto: boolean) => {
    if (!aberto) aoFechar()
  }

  if (celular) {
    return (
      <Drawer open onOpenChange={aoMudar}>
        {/* Começa a 60 px do topo, cantos de cima com raio 26 e alça (ajustados em ui/drawer.tsx). */}
        <DrawerContent className="h-[calc(100dvh-60px)] data-[vaul-drawer-direction=bottom]:max-h-none">
          <div className="flex items-center justify-between gap-3 px-[18px] pb-3 pt-3">
            <DrawerTitle className={classeTitulo}>{titulo}</DrawerTitle>
            <DrawerClose asChild>
              <BotaoX />
            </DrawerClose>
          </div>
          <DrawerDescription className="sr-only">{descricao}</DrawerDescription>
          <div data-vaul-no-drag className="min-h-0 flex-1 overflow-y-auto px-[18px] pb-4">
            {children}
          </div>
          <div className="flex gap-2.5 border-t border-separator-subtle px-[18px] py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
            {rodape}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open onOpenChange={aoMudar}>
      <DialogContent
        showCloseButton={false}
        style={{ width: larguraJanela }}
        className="flex h-[min(760px,calc(100dvh-48px))] max-w-[calc(100vw-48px)] flex-col gap-0 rounded-card p-0 ring-0 sm:max-w-[calc(100vw-48px)]"
      >
        <div className="flex items-center justify-between gap-3 px-6 pb-4 pt-5">
          <DialogTitle className={classeTitulo}>{titulo}</DialogTitle>
          <DialogClose asChild>
            <BotaoX />
          </DialogClose>
        </div>
        <DialogDescription className="sr-only">{descricao}</DialogDescription>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
        <div className="flex justify-end gap-2.5 border-t border-separator-subtle px-6 py-4">{rodape}</div>
      </DialogContent>
    </Dialog>
  )
}
