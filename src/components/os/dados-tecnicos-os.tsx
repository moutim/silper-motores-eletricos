"use client"

import { useState } from "react"
import { Segmentado } from "@/components/motores/segmentado"
import { CartaoLinhas, TituloBloco } from "@/components/motores/ficha/info"
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
    <section aria-label="Dados técnicos desta O.S.">
      <TituloBloco>Dados técnicos desta O.S.</TituloBloco>
      <Segmentado
        rotulo="Versão dos dados técnicos"
        value={visao}
        onValueChange={(v) => v && setVisao(v)}
        opcoes={[
          { valor: "abertura", rotulo: "Na abertura" },
          { valor: "atual", rotulo: "Ficha atual" },
        ]}
      />
      <p className="mb-3 mt-2 px-1 text-xs text-text-tertiary" aria-live="polite">
        {visao === "abertura"
          ? "Retrato dos dados no dia em que a O.S. foi aberta."
          : "Dados do motor hoje."}
        {houveMudanca ? " O que mudou desde a abertura está destacado." : " Nada mudou desde a abertura."}
      </p>
      <div className="flex flex-col gap-3">
        {secoes.map((s) => (
          <div key={s.titulo}>
            <p className="mb-1.5 px-1 text-xs font-semibold text-text-tertiary">{s.titulo}</p>
            <CartaoLinhas linhas={s.linhas.map((l) => ({ rotulo: l.rotulo, valor: l.valor, destaque: l.mudou }))} />
          </div>
        ))}
      </div>
    </section>
  )
}
