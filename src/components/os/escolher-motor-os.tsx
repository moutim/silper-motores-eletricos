"use client"

import { CaretRightIcon, EngineIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { GavetaOuJanela } from "@/components/layout/gaveta-ou-janela"
import { Button } from "@/components/ui/button"
import { config } from "@/lib/config"
import { buscarMotoresBase, type LinhaMotorBase } from "@/server/actions/busca"

interface Resultado {
  q: string
  motores: LinhaMotorBase[]
  total: number
  erro: boolean
}

/**
 * Primeiro passo da Nova O.S.: escolher o motor ao qual ela fica atrelada (só motores ativos).
 * Ao escolher, abre a Nova O.S. dele por cima da tela atual.
 */
export function EscolherMotorOS({ aoFechar }: { aoFechar: () => void }) {
  const router = useRouter()
  const [q, setQ] = useState("")
  const [resultado, setResultado] = useState<Resultado | null>(null)

  useEffect(() => {
    let cancelado = false
    const t = setTimeout(
      async () => {
        let r: Resultado
        try {
          const d = await buscarMotoresBase(q, {})
          r = d.ok ? { q, motores: d.motores, total: d.total, erro: false } : { q, motores: [], total: 0, erro: true }
        } catch {
          r = { q, motores: [], total: 0, erro: true }
        }
        if (!cancelado) setResultado(r)
      },
      resultado === null ? 0 : config.busca.esperaMs,
    )
    return () => {
      cancelado = true
      clearTimeout(t)
    }
    // `resultado` só decide a espera da primeira busca; não deve disparar nova busca.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  function escolher(m: LinhaMotorBase) {
    router.push(`/motores/${encodeURIComponent(m.rastreio)}/os/nova`)
    aoFechar()
  }

  const carregando = resultado === null || resultado.q !== q

  return (
    <GavetaOuJanela
      titulo="Nova O.S."
      descricao="Escolha o motor ao qual a ordem de serviço ficará atrelada."
      aoFechar={aoFechar}
      larguraJanela={600}
      rodape={
        <Button type="button" variant="secondary" className="flex-1 md:flex-none" onClick={aoFechar}>
          Cancelar
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-text-secondary">Para qual motor é esta O.S.?</p>
        <form role="search" className="relative" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="busca-motor-os" className="sr-only">
            Buscar motor
          </label>
          <MagnifyingGlassIcon
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
            aria-hidden="true"
          />
          <input
            id="busca-motor-os"
            type="search"
            autoComplete="off"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rastreio, cliente, marca, potência"
            className="h-12 w-full rounded-[16px] border border-border bg-surface pl-10 pr-3 text-[15px] outline-none placeholder:text-text-tertiary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </form>

        <p className="px-1 text-xs font-medium uppercase tracking-[0.02em] text-text-tertiary" aria-live="polite">
          {resultado ? `${resultado.total} motores` : "Buscando..."}
        </p>

        {resultado?.erro ? (
          <p className="px-1 text-sm text-destructive" role="alert">
            Não foi possível buscar. Tente de novo.
          </p>
        ) : resultado && resultado.motores.length === 0 && !carregando ? (
          <p className="px-1 text-sm text-text-tertiary">Nenhum motor encontrado.</p>
        ) : (
          <ul className={`-mx-1 ${carregando ? "opacity-60" : ""}`} aria-label="Motores">
            {(resultado?.motores ?? []).map((m, i, lista) => (
              <li key={m.id} className={`mx-1 ${i === lista.length - 1 ? "" : "border-b border-separator"}`}>
                <button
                  type="button"
                  onClick={() => escolher(m)}
                  className="-mx-1 flex w-[calc(100%+8px)] items-center gap-3 rounded-field px-1 py-2.5 text-left outline-none hover:bg-fill focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    className="flex size-[30px] shrink-0 items-center justify-center rounded-[8px] bg-[#3A55B6] text-white"
                    aria-hidden="true"
                  >
                    <EngineIcon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{m.nome}</span>
                    <span className="block truncate text-xs text-text-tertiary">
                      {[m.clienteNome, m.rpm && `${m.rpm} RPM`].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-text-tertiary">{m.rastreio}</span>
                  <CaretRightIcon size={14} className="shrink-0 text-text-tertiary" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GavetaOuJanela>
  )
}
