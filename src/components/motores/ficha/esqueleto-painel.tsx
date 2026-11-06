import type { Aba } from "@/lib/ficha"

/** Barra cinza com brilho passando (classe `shimmer`, em globals.css). */
function Barra({ className }: { className: string }) {
  return <div className={`shimmer rounded-md ${className}`} />
}

function CartaoEsqueleto({ linhas }: { linhas: number }) {
  return (
    <div className="rounded-card bg-surface pb-3">
      <TituloEsqueleto />
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className="flex items-center justify-between gap-6 px-4 py-[13px]">
          <Barra className="h-3.5 w-24" />
          <Barra className="h-3.5 w-20" />
        </div>
      ))}
    </div>
  )
}

function TituloEsqueleto() {
  return (
    <div className="flex items-center gap-2 px-4 pb-3 pt-4">
      <Barra className="size-[18px]" />
      <Barra className="h-4 w-28" />
    </div>
  )
}

function ListaEsqueleto({ itens }: { itens: number }) {
  return (
    <div className="rounded-card bg-surface pb-2">
      <TituloEsqueleto />
      {Array.from({ length: itens }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2.5">
          <Barra className="size-[30px] shrink-0 rounded-[8px]" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Barra className="h-3.5 w-24" />
            <Barra className="h-3 w-40 max-w-full" />
          </div>
          <Barra className="h-3 w-14" />
        </div>
      ))}
    </div>
  )
}

function FotosEsqueleto() {
  return (
    <div className="rounded-card bg-surface pb-4">
      <TituloEsqueleto />
      <div className="flex flex-col gap-5 px-4">
        {[0, 1].map((g) => (
          <div key={g} className="flex flex-col gap-2">
            <Barra className="h-3 w-24" />
            <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
              {Array.from({ length: 3 }, (_, i) => (
                <Barra key={i} className="aspect-square w-full rounded-[12px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Painel de carregamento ao trocar de aba na ficha: o esqueleto tem a forma da aba de destino
 * (dados: 3 colunas de cartões; O.S.: detalhe e histórico; fotos: um cartão com grades de fotos).
 */
export function EsqueletoPainel({ aba }: { aba: Aba }) {
  return (
    <div role="status" aria-live="polite" aria-label="Carregando">
      <span className="sr-only">Carregando...</span>
      {aba === "dados" && (
        <div className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_340px] md:items-start md:gap-5">
          <CartaoEsqueleto linhas={6} />
          <CartaoEsqueleto linhas={4} />
          <div className="max-md:hidden">
            <CartaoEsqueleto linhas={2} />
          </div>
        </div>
      )}
      {aba === "os" && (
        <div className="md:grid md:grid-cols-[minmax(0,1fr)_340px] md:items-start md:gap-5">
          <div className="max-md:hidden">
            <CartaoEsqueleto linhas={7} />
          </div>
          <ListaEsqueleto itens={4} />
        </div>
      )}
      {aba === "fotos" && <FotosEsqueleto />}
    </div>
  )
}
