"use client"

import { ImageIcon, XIcon } from "@phosphor-icons/react"
import { Dropzone } from "./dropzone"

/**
 * Escolha de fotos nos cadastros (motor e O.S.): as fotos ficam na tela e são enviadas só depois de
 * salvar, quando o motor ou a O.S. já existe.
 */
export function SeletorFotos({
  rotulo,
  arquivos,
  aoMudar,
  desabilitado,
}: {
  rotulo: string
  arquivos: File[]
  aoMudar: (arquivos: File[]) => void
  desabilitado?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <Dropzone rotulo={rotulo} aoEscolher={(novos) => aoMudar([...arquivos, ...novos])} desabilitado={desabilitado} />
      {arquivos.length > 0 && (
        <ul className="flex flex-col gap-1.5" aria-label="Fotos escolhidas">
          {arquivos.map((a, i) => (
            <li key={`${a.name}-${i}`} className="flex items-center gap-2 rounded-field bg-bg px-3 py-2 text-[13px]">
              <ImageIcon size={18} className="shrink-0 text-text-tertiary" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{a.name}</span>
              <span className="shrink-0 text-xs tabular-nums text-text-tertiary">{Math.max(1, Math.round(a.size / 1024))} KB</span>
              <button
                type="button"
                aria-label={`Remover ${a.name}`}
                disabled={desabilitado}
                onClick={() => aoMudar(arquivos.filter((_, j) => j !== i))}
                className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-fill text-text-tertiary outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <XIcon size={14} weight="bold" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
