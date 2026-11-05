"use client"

import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { config } from "@/lib/config"
import { rotuloDoMes } from "@/lib/os-lista"

const TODOS = "__todos"

function destino(q: string, mes: string) {
  const sp = new URLSearchParams()
  if (q.trim()) sp.set("q", q)
  if (mes) sp.set("mes", mes)
  const s = sp.toString()
  return s ? `/os?${s}` : "/os"
}

/** Busca da lista de O.S. (atualiza ao digitar, 250 ms) e filtro por mês. Estado na URL. */
export function BarraBuscaOS({ q, mes, meses }: { q: string; mes: string; meses: string[] }) {
  const router = useRouter()
  const [texto, setTexto] = useState(q)
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
      <Select
        value={mes || TODOS}
        onValueChange={(v) => {
          enviado.current = texto
          router.replace(destino(texto, v === TODOS ? "" : v), { scroll: false })
        }}
      >
        <SelectTrigger
          aria-label="Filtrar por mês"
          className="h-12 w-[150px] shrink-0 rounded-[16px] border-0 bg-surface px-4 text-sm font-semibold md:h-[52px] md:w-[210px]"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todos os meses</SelectItem>
          {opcoes.map((m) => (
            <SelectItem key={m} value={m}>
              {rotuloDoMes(m)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
