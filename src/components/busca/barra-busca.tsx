"use client"

import { FunnelSimpleIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { config } from "@/lib/config"
import { FILTROS, type Filtros, montarQuery, type OpcoesFiltros, temFiltros } from "@/lib/busca"
import { FiltrosAvancados } from "./filtros-avancados"

interface Props {
  q: string
  filtros: Filtros
  opcoes: OpcoesFiltros
  /**
   * "digitando": atualiza /motores ao digitar, com espera de 250 ms (doc 01, 5.6).
   * "enviar": na Início, abre a busca (/motores) ao confirmar com Enter ou ao aplicar filtros (doc 03, 1.1).
   */
  modo: "digitando" | "enviar"
}

/** Campo de busca com lupa e botão "Filtros" ao lado; filtros ativos viram cápsulas que se removem com um toque. */
export function BarraBusca({ q, filtros, opcoes, modo }: Props) {
  const router = useRouter()
  const [texto, setTexto] = useState(q)
  const [painel, setPainel] = useState(false)
  const ultimoEnviado = useRef(q)

  const ir = (proximoQ: string, proximos: Filtros, substituir = true) => {
    const destino = `/motores${montarQuery({ q: proximoQ, filtros: proximos })}`
    if (substituir) router.replace(destino, { scroll: false })
    else router.push(destino)
  }

  // Espera de 250 ms depois da última tecla; não repete a navegação se o texto não mudou.
  useEffect(() => {
    if (modo !== "digitando" || texto === ultimoEnviado.current) return
    const t = setTimeout(() => {
      ultimoEnviado.current = texto
      ir(texto, filtros)
    }, config.busca.esperaMs)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto, modo])

  const ativos = FILTROS.filter(({ chave }) => filtros[chave])
  const total = ativos.length

  return (
    <div className="flex flex-col gap-2">
      <form
        role="search"
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          ultimoEnviado.current = texto
          ir(texto, filtros, modo === "digitando")
        }}
      >
        <div className="relative min-w-0 flex-1">
          <label htmlFor="busca" className="sr-only">
            Buscar motores e ordens de serviço
          </label>
          <MagnifyingGlassIcon
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
            aria-hidden="true"
          />
          <input
            id="busca"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Rastreio, cliente, O.S., marca, potência"
            className="h-12 w-full rounded-[16px] border border-border bg-surface pl-10 pr-3 text-[15px] outline-none placeholder:text-text-tertiary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:h-[52px]"
          />
        </div>
        <button
          type="button"
          onClick={() => setPainel(true)}
          aria-haspopup="dialog"
          className="flex h-12 shrink-0 items-center gap-2 rounded-[16px] bg-surface px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-[52px]"
        >
          <FunnelSimpleIcon size={18} aria-hidden="true" />
          <span className="max-md:sr-only">Filtros</span>
          {total > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-orange-light text-xs font-bold text-orange-text">
              <span className="sr-only">{total} ativo(s): </span>
              {total}
            </span>
          )}
        </button>
      </form>

      {temFiltros(filtros) && (
        <ul className="flex flex-wrap gap-2" aria-label="Filtros ativos">
          {ativos.map(({ chave, rotulo }) => (
            <li key={chave}>
              <button
                type="button"
                onClick={() => ir(texto, { ...filtros, [chave]: "" })}
                aria-label={`Remover filtro ${rotulo}: ${filtros[chave]}`}
                className="flex min-h-8 items-center gap-1.5 rounded-full bg-blue-light px-3 text-xs font-semibold text-blue-text outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {rotulo}: {filtros[chave]}
                <XIcon size={12} weight="bold" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {painel && (
        <FiltrosAvancados
          filtros={filtros}
          opcoes={opcoes}
          aoFechar={() => setPainel(false)}
          aoAplicar={(novos) => {
            setPainel(false)
            ultimoEnviado.current = texto
            ir(texto, novos, modo === "digitando")
          }}
        />
      )}
    </div>
  )
}
