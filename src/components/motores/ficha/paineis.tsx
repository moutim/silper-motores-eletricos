import Link from "next/link"
import { Button } from "@/components/ui/button"
import { linhasBobinagem, linhasDadosGerais, ordenarBobinagens, tituloBobinagem } from "@/lib/ficha"
import type { Bobinagem, Motor } from "@/lib/types"
import { CartaoLinhas, TituloBloco } from "./info"

export function Vazio({
  icone,
  titulo,
  apoio,
  acao,
  href,
}: {
  icone: React.ReactNode
  titulo: string
  apoio: string
  acao: string
  /** Quando existe, o botão leva para essa rota; sem ela, aparece desabilitado ("Em breve"). */
  href?: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card bg-surface px-6 py-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-[8px] bg-fill text-text-tertiary" aria-hidden="true">
        {icone}
      </span>
      <div>
        <p className="text-sm font-bold">{titulo}</p>
        <p className="mt-1 text-xs text-text-tertiary">{apoio}</p>
      </div>
      {href ? (
        <Button asChild className="h-[42px] text-[13px]">
          <Link href={href}>{acao}</Link>
        </Button>
      ) : (
        <Button disabled variant="secondary" className="h-[42px] text-[13px]">
          {acao} <span className="text-xs font-normal">· Em breve</span>
        </Button>
      )}
    </div>
  )
}

/** Aba "Dados técnicos" (3.1 e 3.2): todos os dados gerais e a bobinagem; no desktop, 3 colunas. */
export function PainelDados({ motor, bobinagens }: { motor: Motor; bobinagens: Bobinagem[] }) {
  return (
    <div className="md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_340px] md:items-start md:gap-5">
      <div>
        <TituloBloco>Dados gerais</TituloBloco>
        <CartaoLinhas linhas={linhasDadosGerais(motor)} />
      </div>

      <div>
        {ordenarBobinagens(bobinagens).map((b) => (
          <div key={b.id} className="md:mt-5 md:first:mt-0">
            <TituloBloco>{tituloBobinagem(b)}</TituloBloco>
            <CartaoLinhas linhas={linhasBobinagem(b)} />
          </div>
        ))}
        {bobinagens.length === 0 && (
          <>
            <TituloBloco>Bobinagem</TituloBloco>
            <p className="px-4 text-sm text-text-tertiary md:px-1">Sem dados de bobinagem.</p>
          </>
        )}
      </div>

      <div className="hidden md:block">
        <TituloBloco>Últimas O.S.</TituloBloco>
        <div className="rounded-card bg-surface px-4 py-6 text-center text-sm text-text-tertiary">Nenhuma O.S. ainda</div>
      </div>
    </div>
  )
}
