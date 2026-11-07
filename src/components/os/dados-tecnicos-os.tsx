"use client"

import { useState } from "react"
import { Segmentado } from "@/components/motores/segmentado"
import { ListBulletsIcon } from "@phosphor-icons/react/ssr"
import { CartaoSecao } from "@/components/layout/cartao-secao"
import { CartaoLinhas } from "@/components/motores/ficha/info"
import type { SecaoComparada } from "@/lib/retrato-diff"

/**
 * "Dados técnicos desta O.S." (3.5 e 3.6): alternador Na abertura / Ficha atual. O que mudou desde a
 * abertura aparece destacado nas duas visões.
 */
export function DadosTecnicosOS({
  naAbertura,
  fichaAtual,
  houveMudanca,
}: {
  naAbertura: SecaoComparada[]
  fichaAtual: SecaoComparada[]
  houveMudanca: boolean
}) {
  const [visao, setVisao] = useState<"abertura" | "atual">("abertura")
  const secoes = visao === "abertura" ? naAbertura : fichaAtual

  return (
    <CartaoSecao
      rotulo="Dados técnicos desta O.S."
      titulo="Dados técnicos desta O.S."
      icone={<ListBulletsIcon size={18} />}
      acao={null}
    >
      <div className="px-4 pb-1 pt-1">
      <Segmentado
        rotulo="Versão dos dados técnicos"
        value={visao}
        onValueChange={(v) => v && setVisao(v)}
        opcoes={[
          { valor: "abertura", rotulo: "Na abertura" },
          { valor: "atual", rotulo: "Ficha atual" },
        ]}
      />
      <p className="mt-2 text-xs text-text-tertiary" aria-live="polite">
        {visao === "abertura"
          ? "Retrato dos dados no dia em que a O.S. foi aberta."
          : "Dados do motor hoje."}
        {houveMudanca ? " O que mudou desde a abertura está destacado." : " Nada mudou desde a abertura."}
      </p>
      </div>
      <div className="mt-2 flex flex-col gap-2">
        {secoes.map((s) => (
          <div key={s.titulo}>
            <p className="px-4 pb-1 pt-2 text-xs font-semibold text-text-tertiary">{s.titulo}</p>
            <CartaoLinhas
              dentroDeCartao
              linhas={s.linhas.map((l) => ({ rotulo: l.rotulo, valor: l.valor, destaque: l.mudou }))}
            />
          </div>
        ))}
      </div>
    </CartaoSecao>
  )
}
