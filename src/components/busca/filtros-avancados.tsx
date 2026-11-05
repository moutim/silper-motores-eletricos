"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer"
import { Field, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { FILTROS, type Filtros, type OpcoesFiltros } from "@/lib/busca"
import { XIcon } from "@phosphor-icons/react"

const TODOS = "__todos"

interface Props {
  filtros: Filtros
  opcoes: OpcoesFiltros
  aoAplicar: (filtros: Filtros) => void
  aoFechar: () => void
}

function Campos({ valores, opcoes, aoMudar }: { valores: Filtros; opcoes: OpcoesFiltros; aoMudar: (f: Filtros) => void }) {
  return (
    <div className="flex flex-col gap-4">
      {FILTROS.map(({ chave, rotulo }) => {
        const lista = opcoes[chave]
        const atual = valores[chave] ?? ""
        // Um valor vindo da URL que já não existe na planilha continua visível e removível.
        const todas = atual && !lista.includes(atual) ? [atual, ...lista] : lista
        return (
          <Field key={chave}>
            <FieldLabel htmlFor={`filtro-${chave}`} className="text-xs font-semibold text-text-tertiary">
              {rotulo}
            </FieldLabel>
            <Select
              value={atual === "" ? TODOS : atual}
              onValueChange={(v) => aoMudar({ ...valores, [chave]: v === TODOS ? "" : v })}
            >
              <SelectTrigger id={`filtro-${chave}`} className="h-11 w-full rounded-field bg-surface md:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos</SelectItem>
                {todas.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )
      })}
    </div>
  )
}

/**
 * Filtros avançados (doc 03, 1.1, "a desenhar"): gaveta no celular, painel lateral no desktop.
 * Marca, potência, RPM, tensão, pacote, diâmetro e tipo; somam-se à busca (doc 01, 5.6).
 */
export function FiltrosAvancados({ filtros, opcoes, aoAplicar, aoFechar }: Props) {
  const celular = useIsMobile()
  const [valores, setValores] = useState<Filtros>(filtros)
  const aoMudarAberto = (aberto: boolean) => {
    if (!aberto) aoFechar()
  }
  const acoes = (
    <>
      <Button type="button" variant="secondary" className="flex-1 md:flex-none" onClick={() => setValores({})}>
        Limpar
      </Button>
      <Button type="button" className="flex-1 md:flex-none" onClick={() => aoAplicar(valores)}>
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
          <DrawerDescription className="sr-only">Filtrar os motores por marca, potência, RPM, tensão, pacote, diâmetro e tipo.</DrawerDescription>
          <div data-vaul-no-drag className="min-h-0 flex-1 overflow-y-auto px-[18px] pb-4">
            <Campos valores={valores} opcoes={opcoes} aoMudar={setValores} />
          </div>
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
          <SheetDescription className="sr-only">Filtrar os motores por marca, potência, RPM, tensão, pacote, diâmetro e tipo.</SheetDescription>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          <Campos valores={valores} opcoes={opcoes} aoMudar={setValores} />
        </div>
        <div className="flex justify-end gap-2.5 border-t border-separator-subtle px-6 py-4">{acoes}</div>
      </SheetContent>
    </Sheet>
  )
}
