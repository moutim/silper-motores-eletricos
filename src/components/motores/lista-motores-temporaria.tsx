import { CaretRightIcon, EngineIcon } from "@phosphor-icons/react/ssr"
import Link from "next/link"
import { nomeCurto } from "@/lib/motor-format"
import { listarMotoresAtivos } from "@/server/motores"

/**
 * TEMPORÁRIA (Fase 2): lista simples para conferir os cadastros. A busca de verdade (2.1) a substitui
 * na Fase 6. As linhas já abrem a ficha (Fase 3).
 */
export async function ListaMotoresTemporaria() {
  const motores = await listarMotoresAtivos()

  if (motores.length === 0) {
    return <p className="px-1 text-sm text-text-tertiary">Nenhum motor ainda. Cadastre o primeiro.</p>
  }

  return (
    <section className="flex flex-col gap-2" aria-label="Motores">
      <h2 className="px-4 text-xs font-medium uppercase tracking-[0.02em] text-text-tertiary">
        Motores ({motores.length})
      </h2>
      <ul className="overflow-hidden rounded-card bg-surface px-4">
        {motores.map((m, i) => (
          <li key={m.id}>
            <Link
              href={`/motores/${encodeURIComponent(m.rastreio)}`}
              className="flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
            <span
              className="flex size-[30px] shrink-0 items-center justify-center rounded-[8px] bg-[#3A55B6] text-white"
              aria-hidden="true"
            >
              <EngineIcon size={18} />
            </span>
            <span
              className={`flex min-w-0 flex-1 items-center gap-3 py-2.5 ${i < motores.length - 1 ? "border-b border-separator" : ""}`}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{nomeCurto(m)}</span>
                <span className="block truncate text-xs text-text-tertiary">
                  {[m.clienteNome, m.rpm && `${m.rpm} RPM`].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span className="shrink-0 text-xs tabular-nums text-text-tertiary">{m.rastreio}</span>
              <CaretRightIcon size={14} className="shrink-0 text-text-tertiary" aria-hidden="true" />
            </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
