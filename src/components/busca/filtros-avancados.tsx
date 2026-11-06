"use client"

import { FILTROS, type Filtros, type OpcoesFiltros } from "@/lib/busca"
import { PainelFiltros } from "./painel-filtros"

interface Props {
  filtros: Filtros
  opcoes: OpcoesFiltros
  aoAplicar: (filtros: Filtros) => void
  aoFechar: () => void
}

/**
 * Filtros avançados (doc 03, 1.1, "a desenhar"): marca, potência, RPM, tensão, pacote, diâmetro e tipo;
 * somam-se à busca (doc 01, 5.6).
 */
export function FiltrosAvancados({ filtros, opcoes, aoAplicar, aoFechar }: Props) {
  return (
    <PainelFiltros
      valores={filtros}
      campos={FILTROS.map(({ chave, rotulo }) => ({ chave, rotulo, opcoes: opcoes[chave].map((o) => ({ valor: o, rotulo: o })) }))}
      descricao="Filtrar os motores por marca, potência, RPM, tensão, pacote, diâmetro e tipo."
      aoFechar={aoFechar}
      aoAplicar={(v) => aoAplicar(v as Filtros)}
    />
  )
}
