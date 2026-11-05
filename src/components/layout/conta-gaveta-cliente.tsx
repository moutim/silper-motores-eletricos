"use client"

import { SignOutIcon, XIcon } from "@phosphor-icons/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { iniciais } from "@/lib/iniciais"
import { sair } from "@/server/actions/sair"
import type { Usuario } from "@/server/usuario"

/** Ícone da Silper (45 × 30 px) no topo do celular; ao tocar abre a gaveta da conta (D-19). */
export function ContaGavetaCliente({ usuario }: { usuario: Usuario }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button type="button" aria-label="Abrir conta" className="block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <IconeSilper />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="flex items-center justify-between px-[18px] pb-2 pt-3">
          <DrawerTitle className="text-[21px] font-bold leading-[1.15] tracking-[-0.02em]">Conta</DrawerTitle>
          <DrawerClose asChild>
            <button
              type="button"
              aria-label="Fechar"
              className="flex size-[30px] items-center justify-center rounded-full bg-fill text-text-tertiary outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <XIcon size={16} weight="bold" aria-hidden="true" />
            </button>
          </DrawerClose>
        </div>
        <DrawerDescription className="sr-only">Dados da conta Google e opção de sair.</DrawerDescription>

        <div className="mx-[18px] flex items-center gap-3 rounded-card bg-bg px-4 py-3">
          <Avatar className="size-12">
            {usuario.foto && <AvatarImage src={usuario.foto} alt="" referrerPolicy="no-referrer" />}
            <AvatarFallback className="font-semibold">{iniciais(usuario.nome)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-[17px] font-bold leading-tight">{usuario.nome}</p>
            <p className="truncate text-xs text-text-tertiary">{usuario.email}</p>
          </div>
        </div>

        <form action={sair} className="px-[18px] pb-4 pt-4">
          <Button type="submit" variant="outline" className="w-full text-destructive">
            <SignOutIcon aria-hidden="true" />
            Sair
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

export function IconeSilper() {
  const alt = ""
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/silper-icone.svg" alt={alt} width={45} height={30} className="block h-[30px] w-[45px] dark:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/silper-icone-fundo-escuro.svg" alt={alt} width={45} height={30} className="hidden h-[30px] w-[45px] dark:block" />
    </>
  )
}
