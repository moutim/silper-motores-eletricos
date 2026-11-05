import { ClipboardTextIcon, CurrencyCircleDollarIcon, EngineIcon, UsersIcon } from "@phosphor-icons/react/ssr"
import { formatarMoeda, mesCorrente, nomeDoMes } from "@/lib/format"
import type { Indicadores } from "@/lib/inicio"

const numero = new Intl.NumberFormat("pt-BR")

/** Quadrado suave de cada cartão: azul, laranja, verde e cinza (doc 02, 6.5). */
const CORES = {
  azul: "bg-blue-light text-blue-text",
  laranja: "bg-orange-light text-orange-text",
  verde: "bg-[rgba(52,199,89,.16)] text-[#1E7B3A] dark:text-[#6BD68A]",
  cinza: "bg-fill text-text-secondary",
} as const

/** Cartões de informação (doc 01, 5.5): grade 2 × 2 no celular, 4 em linha no desktop. */
export function CartoesInfo({ indicadores }: { indicadores: Indicadores }) {
  const mes = nomeDoMes(mesCorrente())
  const itens = [
    { rotulo: "Motores cadastrados", valor: numero.format(indicadores.motoresAtivos), icone: <EngineIcon size={20} />, cor: CORES.azul },
    { rotulo: `Faturamento de ${mes}`, valor: formatarMoeda(indicadores.faturamento), icone: <CurrencyCircleDollarIcon size={20} />, cor: CORES.laranja },
    { rotulo: "O.S. neste mês", valor: numero.format(indicadores.osNoMes), icone: <ClipboardTextIcon size={20} />, cor: CORES.verde },
    { rotulo: "Clientes atendidos", valor: numero.format(indicadores.clientesAtendidos), icone: <UsersIcon size={20} />, cor: CORES.cinza },
  ]
  return (
    <section aria-label="Resumo" className="grid grid-cols-2 gap-[10px] md:grid-cols-4 md:gap-4">
      {itens.map((i) => (
        <div key={i.rotulo} className="flex flex-col gap-3 rounded-card bg-surface p-4">
          <span className={`flex size-9 items-center justify-center rounded-[8px] md:size-10 ${i.cor}`} aria-hidden="true">
            {i.icone}
          </span>
          <p className="text-[22px] font-bold leading-none tracking-[-0.02em] tabular-nums md:text-2xl">{i.valor}</p>
          <p className="text-xs text-text-tertiary">{i.rotulo}</p>
        </div>
      ))}
    </section>
  )
}
