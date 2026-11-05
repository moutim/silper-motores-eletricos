import type { Linha } from "@/lib/ficha"

/** Título de seção (doc 02, seção 2): 12 px, caixa alta, +0,02 em, cor terciária. */
export function TituloBloco({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 mt-5 px-4 text-xs font-medium uppercase tracking-[0.02em] text-text-tertiary md:mt-0 md:px-1">
      {children}
    </h3>
  )
}

/** Linha de informação (doc 02, 6.6): rótulo em preto à esquerda, valor em cinza à direita, divisor com recuo de 16 px. */
export function CartaoLinhas({ linhas }: { linhas: Linha[] }) {
  return (
    <ul className="overflow-hidden rounded-card bg-surface">
      {linhas.map((l) => (
        <li
          key={l.rotulo}
          className="relative flex items-center justify-between gap-3 px-4 py-[13px] text-sm after:absolute after:bottom-0 after:left-4 after:right-0 after:h-px after:bg-separator last:after:hidden"
        >
          <span className="shrink-0">{l.rotulo}</span>
          <span className="min-w-0 text-right text-text-tertiary">{l.valor ?? "Não informado"}</span>
        </li>
      ))}
    </ul>
  )
}
