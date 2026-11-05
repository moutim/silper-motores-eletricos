import { CaretRightIcon, EngineIcon } from "@phosphor-icons/react/ssr"
import Link from "next/link"
import { nomeCurto } from "@/lib/motor-format"
import type { Motor } from "@/lib/types"

/** Linha de motor (doc 02, 6.4): ícone azul, nome curto, "{cliente} · {RPM}", rastreio e seta. Abre a ficha. */
export function LinhaMotor({ motor, ultima }: { motor: Motor; ultima: boolean }) {
  return (
    <li>
      <Link
        href={`/motores/${encodeURIComponent(motor.rastreio)}`}
        className="flex items-center gap-3 px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          className="flex size-[30px] shrink-0 items-center justify-center rounded-[8px] bg-[#3A55B6] text-white"
          aria-hidden="true"
        >
          <EngineIcon size={18} />
        </span>
        <span className={`flex min-w-0 flex-1 items-center gap-3 py-2.5 ${ultima ? "" : "border-b border-separator"}`}>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {nomeCurto(motor)}
              {!motor.ativo && <span className="ml-2 text-xs font-normal text-text-tertiary">Desativado</span>}
            </span>
            <span className="block truncate text-xs text-text-tertiary">
              {[motor.clienteNome, motor.rpm && `${motor.rpm} RPM`].filter(Boolean).join(" · ")}
            </span>
          </span>
          <span className="shrink-0 text-xs tabular-nums text-text-tertiary">{motor.rastreio}</span>
          <CaretRightIcon size={14} className="shrink-0 text-text-tertiary" aria-hidden="true" />
        </span>
      </Link>
    </li>
  )
}
