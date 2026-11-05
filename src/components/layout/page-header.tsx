import { Suspense } from "react"
import { ContaGaveta } from "./conta-gaveta"
import { IconeSilper } from "./conta-gaveta-cliente"

/**
 * Cabeçalho de página (doc 02, 6.1). Celular: título à esquerda e o ícone da Silper à direita, nada
 * mais. Desktop: só o título (a logo fica no menu lateral).
 */
export function PageHeader({ titulo }: { titulo: string }) {
  return (
    <header className="flex items-center justify-between gap-3">
      <h1 className="text-[21px] font-bold leading-[1.15] tracking-[-0.02em] md:text-2xl">{titulo}</h1>
      <div className="md:hidden">
        <Suspense fallback={<IconeSilper />}>
          <ContaGaveta />
        </Suspense>
      </div>
    </header>
  )
}
