import Link from "next/link"
import { Button } from "@/components/ui/button"
import { linhasBobinagem, linhasDadosGerais, ordenarBobinagens, tituloBobinagem } from "@/lib/ficha"
import { config } from "@/lib/config"
import type { Bobinagem, Motor, OrdemServico } from "@/lib/types"
import { LinhaOSMotor } from "@/components/os/linha-os-motor"
import { ClipboardTextIcon, LightningIcon, ListBulletsIcon } from "@phosphor-icons/react/ssr"
import { CartaoSecao } from "@/components/layout/cartao-secao"
import { CartaoLinhas } from "./info"

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

/** Aba "Dados técnicos" (3.1 e 3.2): todos os dados gerais e a bobinagem, cada bloco num cartão com o título dentro; no desktop, 3 colunas. */
export function PainelDados({
  motor,
  bobinagens,
  ordens,
}: {
  motor: Motor
  bobinagens: Bobinagem[]
  /** O.S. do motor, da mais recente para a mais antiga. */
  ordens: OrdemServico[]
}) {
  const base = `/motores/${encodeURIComponent(motor.rastreio)}?aba=os`
  const ultimas = ordens.slice(0, config.inicio.ultimasOS)
  return (
    <div className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_340px] md:items-start md:gap-5">
      <CartaoSecao titulo="Dados gerais" icone={<ListBulletsIcon size={18} />} acao={null}>
        <CartaoLinhas linhas={linhasDadosGerais(motor)} dentroDeCartao />
      </CartaoSecao>

      <div className="flex flex-col gap-3 md:gap-5">
        {ordenarBobinagens(bobinagens).map((b) => (
          <CartaoSecao key={b.id} titulo={tituloBobinagem(b)} icone={<LightningIcon size={18} />} acao={null}>
            <CartaoLinhas linhas={linhasBobinagem(b)} dentroDeCartao />
          </CartaoSecao>
        ))}
        {bobinagens.length === 0 && (
          <CartaoSecao titulo="Bobinagem" icone={<LightningIcon size={18} />} acao={null}>
            <p className="px-4 pb-3 pt-1 text-sm text-text-tertiary">Sem dados de bobinagem.</p>
          </CartaoSecao>
        )}
      </div>

      <div className="max-md:hidden">
        <CartaoSecao
          titulo="Últimas O.S."
          icone={<ClipboardTextIcon size={18} />}
          acao={
            ordens.length > ultimas.length ? (
              <Link href={base} className="text-xs font-semibold text-blue outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                Ver todas ({ordens.length})
              </Link>
            ) : null
          }
        >
          {ultimas.length === 0 ? (
            <p className="px-4 pb-3 pt-1 text-sm text-text-tertiary">Nenhuma O.S. ainda</p>
          ) : (
            <ul>
              {ultimas.map((os, i) => (
                <LinhaOSMotor
                  key={os.id}
                  os={os}
                  motor={motor}
                  ultima={i === ultimas.length - 1}
                  direita="data"
                  href={`${base}&os=${os.id}`}
                />
              ))}
            </ul>
          )}
        </CartaoSecao>
      </div>
    </div>
  )
}
