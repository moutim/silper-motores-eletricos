/**
 * Cartão de seção (mesmo formato do financeiro): título com ícone dentro do cartão e o conteúdo logo
 * abaixo. As linhas de lista vão de ponta a ponta; o título e o rodapé seguem o padding de 16 px.
 */
export function CartaoSecao({
  titulo,
  icone,
  rotulo,
  acao,
  children,
}: {
  titulo: React.ReactNode
  icone: React.ReactNode
  /** `aria-label` da seção, quando o título visível não basta. */
  rotulo?: string
  /** Ação à direita do título. Sem ela (`undefined`), mostra a dica "Clique/Toque para abrir"; `null` não mostra nada. */
  acao?: React.ReactNode | null
  children: React.ReactNode
}) {
  return (
    <section aria-label={rotulo} className="overflow-hidden rounded-card bg-surface pb-1">
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
          <span className="text-blue" aria-hidden="true">
            {icone}
          </span>
          {titulo}
        </h2>
        {acao !== undefined ? acao : (
          <span className="text-xs text-text-tertiary">
            <span className="md:hidden">Toque para abrir</span>
            <span className="max-md:hidden">Clique para abrir</span>
          </span>
        )}
      </div>
      {children}
    </section>
  )
}
