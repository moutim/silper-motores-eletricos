"use client"

import { FunnelSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { PainelFiltros } from "@/components/busca/painel-filtros"
import { config } from "@/lib/config"
import { rotuloDoMes } from "@/lib/os-lista"

function destino(q: string, mes: string) {
  const sp = new URLSearchParams()
  if (q.trim()) sp.set("q", q)
  if (mes) sp.set("mes", mes)
  const s = sp.toString()
  return s ? `/os?${s}` : "/os"
}

/** Busca da lista de O.S. (atualiza ao digitar, 250 ms) e botão Filtros (gaveta) com o filtro por mês. Estado na URL. */
export function BarraBuscaOS({ q, mes, meses }: { q: string; mes: string; meses: string[] }) {
  const router = useRouter()
  const [texto, setTexto] = useState(q)
  const [painel, setPainel] = useState(false)
  const enviado = useRef(q)

  useEffect(() => {
    if (texto === enviado.current) return
    const t = setTimeout(() => {
      enviado.current = texto
      router.replace(destino(texto, mes), { scroll: false })
    }, config.busca.esperaMs)
    return () => clearTimeout(t)
  }, [texto, mes, router])

  const opcoes = mes && !meses.includes(mes) ? [mes, ...meses] : meses
  return (
    <div className="flex gap-2">
      <form role="search" className="relative min-w-0 flex-1" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="busca-os" className="sr-only">
          Buscar ordens de serviço
        </label>
        <MagnifyingGlassIcon
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
          aria-hidden="true"
        />
        <input
          id="busca-os"
          type="search"
          autoComplete="off"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Número da O.S., cliente, marca"
          className="h-12 w-full rounded-[16px] border border-border bg-surface pl-10 pr-3 text-[15px] outline-none placeholder:text-text-tertiary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:h-[52px]"
        />
      </form>
      <button
        type="button"
        onClick={() => setPainel(true)}
        aria-haspopup="dialog"
        className="flex h-12 shrink-0 items-center gap-2 rounded-[16px] bg-surface px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-[52px]"
      >
        <FunnelSimpleIcon size={18} aria-hidden="true" />
        <span className="max-md:sr-only">Filtros</span>
        {mes && (
          <span className="flex size-5 items-center justify-center rounded-full bg-orange-light text-xs font-bold text-orange-text">
            <span className="sr-only">1 ativo: </span>1
          </span>
        )}
      </button>
      {painel && (
        <PainelFiltros
          valores={{ mes }}
          campos={[{ chave: "mes", rotulo: "Mês", opcoes: opcoes.map((m) => ({ valor: m, rotulo: rotuloDoMes(m) })) }]}
          descricao="Filtrar as ordens de serviço por mês."
          aoFechar={() => setPainel(false)}
          aoAplicar={(v) => {
            setPainel(false)
            enviado.current = texto
            router.replace(destino(texto, v.mes ?? ""), { scroll: false })
          }}
        />
      )}
    </div>
  )
}
