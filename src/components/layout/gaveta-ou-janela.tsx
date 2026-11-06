"use client"

import { XIcon } from "@phosphor-icons/react"
import type * as React from "react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer"
import { AreaRolavel } from "@/components/layout/area-rolavel"
import { useIsMobile } from "@/hooks/use-mobile"

interface Props {
  titulo: string
  descricao: string
  /** Chamado ao fechar (X, Esc, clique fora ou arrastar a gaveta). */
  aoFechar: () => void
  /** Barra de ações: fixa embaixo na gaveta; no rodapé, à direita, na janela. */
  rodape: React.ReactNode
  /** Selo ao lado do título na janela do desktop (ex.: "SIL-000125 · WEG 5 CV"). */
  tituloExtra?: React.ReactNode
  /** Altura fixa na janela (evita o rodapé pular quando o conteúdo muda). Sem ela, a janela acompanha o conteúdo. */
  alturaFixa?: boolean
  /** Largura da janela no desktop (940 px nos cadastros, 600 px na Nova O.S.). A altura é fixa para o rodapé não pular quando o conteúdo muda. */
  larguraJanela?: number
  children: React.ReactNode
}

function BotaoX({ rotulo = "Fechar", ...props }: { rotulo?: string } & React.ComponentProps<"button">) {
  return (
    <button
      {...props}
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
export function GavetaOuJanela({ titulo, descricao, aoFechar, rodape, tituloExtra, alturaFixa = true, larguraJanela = 940, children }: Props) {
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
          <AreaRolavel naoArrastar className="px-[18px] pb-4">
            {children}
          </AreaRolavel>
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
        className={`flex max-w-[calc(100vw-48px)] flex-col gap-0 rounded-card p-0 ring-0 sm:max-w-[calc(100vw-48px)] ${alturaFixa ? "h-[min(760px,calc(100dvh-48px))]" : "max-h-[calc(100dvh-48px)]"}`}
      >
        <div className="flex items-center justify-between gap-3 px-6 pb-3 pt-4">
          <div className="flex min-w-0 items-center gap-3">
            <DialogTitle className={classeTitulo}>{titulo}</DialogTitle>
            {tituloExtra}
          </div>
          <DialogClose asChild>
            <BotaoX />
          </DialogClose>
        </div>
        <DialogDescription className="sr-only">{descricao}</DialogDescription>
        <AreaRolavel className="px-6 pb-4">{children}</AreaRolavel>
        <div className="flex justify-end gap-2.5 border-t border-separator-subtle px-6 py-3">{rodape}</div>
      </DialogContent>
    </Dialog>
  )
}
