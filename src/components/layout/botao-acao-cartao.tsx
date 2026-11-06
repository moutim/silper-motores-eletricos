import { PlusIcon } from "@phosphor-icons/react/ssr"
import Link from "next/link"

/** Botão "+ ação" no cabeçalho de um cartão de seção (pílula compacta, 40 px no celular e 36 px no desktop). */
export function BotaoAcaoCartao({ href, children, cor = "bg-[#3A55B6]" }: { href: string; children: string; cor?: string }) {
  return (
    <Link
      href={href}
      className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-white outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring md:h-9 ${cor}`}
    >
      <PlusIcon size={16} weight="bold" aria-hidden="true" />
      {children}
    </Link>
  )
}
