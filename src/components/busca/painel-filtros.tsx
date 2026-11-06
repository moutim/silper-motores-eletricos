"use client"

import { useState } from "react"
import { AreaRolavel } from "@/components/layout/area-rolavel"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { XIcon } from "@phosphor-icons/react"
import { cn } from "cn"

const TODOS = "__todos"

export type ValoresFiltro = Record<string, string | undefined>
export interface CampoFiltro {
  chave: string
  rotulo: string
  opcoes: { valor: string; rotulo: string }[]
}

interface Props {
  valores: ValoresFiltro
  campos: CampoFiltro[]
  descricao: string
  aoAplicar: (valores: ValoresFiltro) => void
  aoFechar: () => void
}

function Campos({ valores, campos, rotuloTodos = "Todos", aoMudar }: { valores: ValoresFiltro; campos: CampoFiltro[]; rotuloTodos?: string; aoMudar: (f: ValoresFiltro) => void }) {
  return (
    <div className="overflow-hidden">
      {campos.map(({ chave, rotulo, opcoes: lista }) => {
        const atual = valores[chave] ?? ""
        // Um valor vindo da URL que já não existe na planilha continua visível e removível.
        const todas = atual && !lista.some((o) => o.valor === atual) ? [{ valor: atual, rotulo: atual }, ...lista] : lista
        return (
          <div
            key={chave}
            className="relative flex min-h-[52px] items-center gap-3 pl-0 pr-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-separator-subtle last:after:hidden"
          >
            <Label htmlFor={`filtro-${chave}`} className="shrink-0 text-[15px] font-normal text-text-primary">
              {rotulo}
            </Label>
            <Select
              value={atual === "" ? TODOS : atual}
              onValueChange={(v) => aoMudar({ ...valores, [chave]: v === TODOS ? "" : v })}
            >
              <SelectTrigger
                id={`filtro-${chave}`}
                className={cn(
                  "h-11 min-w-0 flex-1 justify-end gap-1 rounded-field border-0 bg-transparent px-2 text-[15px] shadow-none hover:bg-transparent focus-visible:ring-2 dark:bg-transparent dark:hover:bg-transparent md:h-10",
                  atual === "" ? "text-text-tertiary" : "font-medium text-blue-text"
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end" className="rounded-2xl border-0 p-1.5 shadow-xl ring-1 ring-separator">
                <SelectItem value={TODOS} className="min-h-10 rounded-xl text-[15px]">
                  {rotuloTodos}
                </SelectItem>
                {todas.map((o) => (
                  <SelectItem key={o.valor} value={o.valor} className="min-h-10 rounded-xl text-[15px]">
                    {o.rotulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      })}
    </div>
  )
}

/** Gaveta de filtros no celular, painel lateral no desktop. Cada campo é uma linha com seletor. */
export function PainelFiltros({ valores: iniciais, campos, descricao, aoAplicar, aoFechar }: Props) {
  const celular = useIsMobile()
  const [valores, setValores] = useState<ValoresFiltro>(iniciais)
  const aoMudarAberto = (aberto: boolean) => {
    if (!aberto) aoFechar()
  }
  const acoes = (
    <>
      <Button type="button" variant="secondary" className="flex-1 rounded-full md:flex-none" onClick={() => setValores({})}>
        Limpar
      </Button>
      <Button type="button" className="flex-1 rounded-full md:flex-none" onClick={() => aoAplicar(valores)}>
        Aplicar filtros
      </Button>
    </>
  )

  if (celular) {
    return (
      <Drawer open onOpenChange={aoMudarAberto}>
        <DrawerContent className="h-[calc(100dvh-60px)] data-[vaul-drawer-direction=bottom]:max-h-none">
          <div className="flex items-center justify-between gap-3 px-[18px] pb-3 pt-3">
            <DrawerTitle className="text-[21px] font-bold leading-[1.15] tracking-[-0.02em]">Filtros</DrawerTitle>
            <DrawerClose asChild>
              <button
                type="button"
                aria-label="Fechar"
                className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-fill text-text-tertiary outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <XIcon size={16} weight="bold" aria-hidden="true" />
              </button>
            </DrawerClose>
          </div>
          <DrawerDescription className="sr-only">{descricao}</DrawerDescription>
          <AreaRolavel naoArrastar className="px-[18px] pb-4 pt-4">
            <Campos valores={valores} campos={campos} aoMudar={setValores} />
          </AreaRolavel>
          <div className="flex gap-2.5 border-t border-separator-subtle px-[18px] py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
            {acoes}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open onOpenChange={aoMudarAberto}>
      <SheetContent side="right" className="flex w-[380px] flex-col gap-0 p-0 sm:max-w-[380px]">
        <div className="px-6 pb-4 pt-5">
          <SheetTitle className="text-2xl font-bold leading-[1.15] tracking-[-0.02em]">Filtros</SheetTitle>
          <SheetDescription className="sr-only">{descricao}</SheetDescription>
        </div>
        <AreaRolavel className="px-6 pb-6 pt-5">
          <Campos valores={valores} campos={campos} aoMudar={setValores} />
        </AreaRolavel>
        <div className="flex justify-end gap-2.5 border-t border-separator-subtle px-6 py-4">{acoes}</div>
      </SheetContent>
    </Sheet>
  )
}
