import { CaretRightIcon, ClipboardTextIcon } from "@phosphor-icons/react/ssr"
import Link from "next/link"
import { formatarData } from "@/lib/format"
import { resumoOS } from "@/lib/os-ordem"
import type { OrdemServico } from "@/lib/types"

function LinhaHistorico({ os, href, selecionada }: { os: OrdemServico; href: string; selecionada?: boolean }) {
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        aria-current={selecionada ? "true" : undefined}
        className={`flex items-center gap-3 px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring ${selecionada ? "bg-blue-light" : ""}`}
      >
        <span
          className="flex size-[30px] shrink-0 items-center justify-center rounded-[8px] bg-[#EE6B10] text-white"
          aria-hidden="true"
        >
          <ClipboardTextIcon size={18} />
        </span>
        <span className="relative flex min-w-0 flex-1 items-center gap-3 py-2.5 after:absolute after:bottom-0 after:left-0 after:right-[-16px] after:h-px after:bg-separator">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">O.S. {os.numero}</span>
            <span className="block truncate text-xs text-text-tertiary">{resumoOS(os) || "Sem descrição"}</span>
          </span>
          <span className="shrink-0 text-xs tabular-nums text-text-tertiary">{formatarData(os.dataEntrada)}</span>
          <CaretRightIcon size={14} className="shrink-0 text-text-tertiary" aria-hidden="true" />
        </span>
      </Link>
    </li>
  )
}

/**
 * Histórico de O.S. do motor (3.3). No celular cada linha abre a O.S. (`/os/[id]`); no desktop a linha
 * seleciona a O.S. no painel ao lado (`?aba=os&os=`). Mais recente primeiro.
 */
export function HistoricoOS({
  ordens,
  rastreio,
  selecionadaId,
  modo,
}: {
  ordens: OrdemServico[]
  rastreio: string
  selecionadaId: string
  modo: "celular" | "desktop"
}) {
  const base = `/motores/${encodeURIComponent(rastreio)}?aba=os`
  return (
    <section aria-label="Histórico de O.S.">
      <div className="mb-2 mt-5 flex items-baseline justify-between px-4 md:mt-0 md:px-1">
        <h3 className="text-xs font-medium uppercase tracking-[0.02em] text-text-tertiary">Histórico ({ordens.length})</h3>
        <span className="text-xs text-text-tertiary">{modo === "celular" ? "Toque para abrir" : "Clique para abrir"}</span>
      </div>
      <ul className="overflow-hidden rounded-card bg-surface">
        {ordens.map((os) => (
          <LinhaHistorico
            key={os.id}
            os={os}
            href={modo === "celular" ? `/os/${os.id}` : `${base}&os=${os.id}`}
            selecionada={modo === "desktop" && os.id === selecionadaId}
          />
        ))}
      </ul>
    </section>
  )
}
