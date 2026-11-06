import { CaretRightIcon, ClipboardTextIcon, CopyIcon, PlusIcon } from "@phosphor-icons/react/ssr"
import Link from "next/link"
import { BotaoNovaOS } from "@/components/os/botao-nova-os"

interface Atalho {
  href: string
  titulo: string
  descricao: string
  icone: React.ReactNode
  cor: string
  soDesktop?: boolean
  /** Em vez de ir para `href`, abre o seletor de motor da Nova O.S. por cima da Início. */
  abreSeletorOS?: boolean
  /** No desktop ocupa 2 das 4 colunas, a mesma grade dos cartões de resumo. */
  principal?: boolean
}

const ATALHOS: Atalho[] = [
  {
    href: "/motores/novo",
    titulo: "Cadastrar motor",
    descricao: "Registrar um novo motor na oficina",
    icone: <PlusIcon size={18} />,
    cor: "bg-[#3A55B6]",
    principal: true,
  },
  {
    // "Abrir O.S." abre o seletor de motor; escolhido o motor, abre a Nova O.S. dele.
    href: "/motores",
    abreSeletorOS: true,
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

/** Cartões de atalho (doc 02, 6.5): 2 por linha no celular; grade de 4 colunas no desktop (Cadastrar ocupa 2, como os cartões de resumo). A seta no canto superior direito indica que o cartão é clicável. */
export function Atalhos() {
  return (
    <nav aria-label="Atalhos" className="grid grid-cols-2 gap-[10px] md:grid-cols-4 md:gap-4">
      {ATALHOS.map((a) => {
        const classe = `relative flex flex-col gap-3 rounded-card bg-surface p-4 text-left outline-none transition-colors hover:bg-fill focus-visible:ring-2 focus-visible:ring-ring md:h-[136px] md:justify-between ${a.soDesktop ? "max-md:hidden" : ""} ${a.principal ? "md:col-span-2" : ""}`
        const conteudo = (
          <>
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-[8px] text-white md:size-10 ${a.cor}`}
              aria-hidden="true"
            >
              {a.icone}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">{a.titulo}</span>
              <span className="block min-h-8 text-xs text-text-tertiary md:min-h-0">{a.descricao}</span>
            </span>
            <CaretRightIcon
              size={16}
              weight="bold"
              className="absolute right-3.5 top-6 -translate-y-1/2 text-text-tertiary/70 md:top-[36px] md:size-[18px]"
              aria-hidden="true"
            />
          </>
        )
        return a.abreSeletorOS ? (
          <BotaoNovaOS key={a.titulo} className={classe}>
            {conteudo}
          </BotaoNovaOS>
        ) : (
          <Link key={a.href} href={a.href} className={classe}>
            {conteudo}
          </Link>
        )
      })}
    </nav>
  )
}
