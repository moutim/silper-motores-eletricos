"use client"

import { CaretUpDownIcon, CheckIcon, PlusIcon } from "@phosphor-icons/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatarData } from "@/lib/format"
import { resumoOS } from "@/lib/os-ordem"
import type { OrdemServico } from "@/lib/types"

/**
 * Botão "3 O.S. ⌃⌄" ao lado de "Editar O.S.": abre a lista das O.S. do motor, a atual marcada, e a
 * opção de criar uma nova. Escolher uma recarrega a aba com `?os=`.
 */
export function SeletorOS({
  ordens,
  atual,
  rastreio,
  podeCriar,
}: {
  ordens: OrdemServico[]
  atual: OrdemServico
  rastreio: string
  /** Motor ativo: o menu oferece "Nova O.S.". */
  podeCriar: boolean
}) {
  const base = `/motores/${encodeURIComponent(rastreio)}?aba=os`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          aria-label={`Trocar de O.S. Atual: ${atual.numero}. ${ordens.length} no motor`}
          className="h-[42px] gap-1.5 text-[13px] md:px-4"
        >
          {ordens.length} O.S.
          <CaretUpDownIcon size={14} weight="bold" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-[min(420px,60dvh)] w-[340px] rounded-[14px] p-1.5">
          {ordens.map((os) => {
            const ativa = os.id === atual.id
            return (
              <DropdownMenuItem key={os.id} asChild className="cursor-pointer rounded-[10px] px-3 py-2">
                <Link href={`${base}&os=${os.id}`} scroll={false} aria-current={ativa ? "true" : undefined}>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold">O.S. {os.numero}</span>
                      <span className="shrink-0 text-xs tabular-nums text-text-tertiary">{formatarData(os.dataEntrada)}</span>
                    </span>
                    <span className="block truncate text-xs text-text-tertiary">{resumoOS(os) || "Sem descrição"}</span>
                  </span>
                  <CheckIcon
                    size={16}
                    weight="bold"
                    className={ativa ? "shrink-0 text-primary" : "invisible shrink-0"}
                    aria-hidden="true"
                  />
                </Link>
              </DropdownMenuItem>
            )
          })}
          {podeCriar && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer rounded-[10px] px-3 py-2">
                <Link href={`/motores/${encodeURIComponent(rastreio)}/os/nova`}>
                  <PlusIcon size={16} weight="bold" className="text-primary" aria-hidden="true" />
                  <span className="text-sm font-semibold">Nova O.S.</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
    </DropdownMenu>
  )
}
