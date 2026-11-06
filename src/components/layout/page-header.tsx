import { CaretLeftIcon } from "@phosphor-icons/react/ssr"
import Link from "next/link"
import { Suspense } from "react"
import { ContaGaveta } from "./conta-gaveta"
import { IconeSilper } from "./conta-gaveta-cliente"

/**
 * Cabeçalho de página (doc 02, 6.1). Celular: título à esquerda e o ícone da Silper à direita, nada
 * mais. Desktop: só o título (a logo fica no menu lateral). `voltar` põe uma seta sutil antes do título.
 */
export function PageHeader({ titulo, voltar }: { titulo: string; voltar?: { href: string; rotulo: string } }) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-1">
        {voltar && (
          // A seta (sem fundo, glifo rente à borda do conteúdo) vem antes do título; o -my não aumenta a altura do cabeçalho.
          <Link
            href={voltar.href}
            aria-label={voltar.rotulo}
            title={voltar.rotulo}
            className="-my-1.5 -ml-2 flex size-9 shrink-0 items-center justify-center rounded-full text-text-tertiary outline-none transition-colors hover:bg-fill hover:text-text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CaretLeftIcon size={20} weight="bold" aria-hidden="true" />
          </Link>
        )}
        <h1 className="truncate text-[21px] font-bold leading-[1.15] tracking-[-0.02em] md:text-2xl">{titulo}</h1>
      </div>
      <div className="md:hidden">
        <Suspense fallback={<IconeSilper />}>
          <ContaGaveta />
        </Suspense>
      </div>
    </header>
  )
}
