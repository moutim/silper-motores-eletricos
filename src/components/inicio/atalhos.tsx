import { CaretRightIcon, ClipboardTextIcon, CopyIcon, PlusIcon } from "@phosphor-icons/react/ssr"
import Link from "next/link"

interface Atalho {
  href: string
  titulo: string
  descricao: string
  icone: React.ReactNode
  cor: string
  soDesktop?: boolean
}

const ATALHOS: Atalho[] = [
  {
    href: "/motores/novo",
    titulo: "Cadastrar motor",
    descricao: "Registrar um novo motor na oficina",
    icone: <PlusIcon size={18} />,
    cor: "bg-[#3A55B6]",
  },
  {
    // "Abrir O.S." leva a Motores para escolher o motor; a Nova O.S. abre pela ficha dele (doc 03, 1.1).
    href: "/motores",
    titulo: "Abrir O.S.",
    descricao: "Registrar a entrada de um motor",
    icone: <ClipboardTextIcon size={18} />,
    cor: "bg-[#EE6B10]",
  },
  {
    href: "/motores/novo?base=1",
    titulo: "Copiar de outro motor",
    descricao: "Partir dos dados de um motor já cadastrado",
    icone: <CopyIcon size={18} />,
    cor: "bg-[#3A55B6]",
    soDesktop: true,
  },
]

/** Cartões de atalho (doc 02, 6.5): 2 por linha no celular; 3 em linha, com seta, no desktop. */
export function Atalhos() {
  return (
    <nav aria-label="Atalhos" className="grid grid-cols-2 gap-[10px] md:grid-cols-3 md:gap-4">
      {ATALHOS.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className={`flex flex-col gap-3 rounded-card bg-surface p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex-row md:items-center ${a.soDesktop ? "max-md:hidden" : ""}`}
        >
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-[8px] text-white md:size-10 ${a.cor}`}
            aria-hidden="true"
          >
            {a.icone}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold">{a.titulo}</span>
            <span className="block min-h-8 text-xs text-text-tertiary">{a.descricao}</span>
          </span>
          <CaretRightIcon size={18} className="text-text-tertiary max-md:hidden" aria-hidden="true" />
        </Link>
      ))}
    </nav>
  )
}
