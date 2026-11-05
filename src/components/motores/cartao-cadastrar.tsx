import { CaretRightIcon, PlusIcon } from "@phosphor-icons/react/ssr"
import Link from "next/link"

/** Cartão de ação (doc 02, 6.5): ícone em quadrado, título 14/700 e descrição de duas linhas. */
export function CartaoCadastrar() {
  return (
    <Link
      href="/motores/novo"
      className="flex items-center gap-3 rounded-card bg-surface p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-[#3A55B6] text-white md:size-10"
        aria-hidden="true"
      >
        <PlusIcon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">Cadastrar motor</span>
        <span className="block min-h-8 text-xs text-text-tertiary">Registrar um novo motor na oficina</span>
      </span>
      <CaretRightIcon size={18} className="text-text-tertiary" aria-hidden="true" />
    </Link>
  )
}
