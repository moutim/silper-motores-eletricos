import { CaretRightIcon, ClipboardTextIcon } from "@phosphor-icons/react/ssr"
import Link from "next/link"
import { formatarData, formatarMoeda } from "@/lib/format"
import { nomeCurto } from "@/lib/motor-format"
import type { Motor, OrdemServico } from "@/lib/types"

/**
 * Linha de O.S. fora da ficha (resultado da busca e "Últimas O.S."): "O.S. 4821", "WEG 5 CV · cliente",
 * rastreio (ou a data) à direita. Abre a ficha do motor na aba O.S., com ela selecionada (doc 01, 5.6).
 */
export function LinhaOSMotor({
  os,
  motor,
  ultima,
  direita = "rastreio",
  href,
}: {
  os: OrdemServico
  motor: Motor
  ultima: boolean
  direita?: "rastreio" | "data" | "data-valor"
  /** Destino da linha; padrão: a ficha do motor, aba O.S., com ela selecionada. */
  href?: string
}) {
  return (
    <li>
      <Link
        href={href ?? `/motores/${encodeURIComponent(motor.rastreio)}?aba=os&os=${os.id}`}
        className="flex items-center gap-3 px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          className="flex size-[30px] shrink-0 items-center justify-center rounded-[8px] bg-[#EE6B10] text-white"
          aria-hidden="true"
        >
          <ClipboardTextIcon size={18} />
        </span>
        <span className={`flex min-w-0 flex-1 items-center gap-3 py-2.5 ${ultima ? "" : "border-b border-separator"}`}>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">O.S. {os.numero}</span>
            <span className="block truncate text-xs text-text-tertiary">
              {[nomeCurto(motor), motor.clienteNome].filter(Boolean).join(" · ")}
            </span>
          </span>
          {direita === "data-valor" ? (
            <span className="shrink-0 text-right text-xs tabular-nums text-text-tertiary">
              <span className="block">{formatarData(os.dataEntrada)}</span>
              {os.valorNota !== null && <span className="block">{formatarMoeda(os.valorNota)}</span>}
            </span>
          ) : (
            <span className="shrink-0 text-xs tabular-nums text-text-tertiary">
              {direita === "data" ? formatarData(os.dataEntrada) : motor.rastreio}
            </span>
          )}
          <CaretRightIcon size={14} className="shrink-0 text-text-tertiary" aria-hidden="true" />
        </span>
      </Link>
    </li>
  )
}
