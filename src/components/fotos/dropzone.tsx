"use client"

import { CameraPlusIcon, SpinnerIcon } from "@phosphor-icons/react"
import { useId, useRef, useState } from "react"

const ACEITOS = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"

interface Props {
  rotulo: string
  aoEscolher: (arquivos: File[]) => void
  desabilitado?: boolean
  ocupado?: boolean
  /** Quadrado pequeno para ficar na grade de fotos. */
  ladrilho?: boolean
  multiple?: boolean
}

/**
 * Envio de fotos (componente próprio, doc 02, seção 5): área de borda tracejada que abre a câmera ou a
 * galeria e também aceita arrastar e soltar. Acessível por teclado.
 */
export function Dropzone({ rotulo, aoEscolher, desabilitado, ocupado, ladrilho, multiple = true }: Props) {
  const entrada = useRef<HTMLInputElement>(null)
  const id = useId()
  const [arrastando, setArrastando] = useState(false)
  const bloqueado = desabilitado || ocupado

  function escolher(lista: FileList | null) {
    const arquivos = [...(lista ?? [])]
    if (arquivos.length) aoEscolher(multiple ? arquivos : arquivos.slice(0, 1))
    if (entrada.current) entrada.current.value = "" // permite escolher o mesmo arquivo de novo
  }

  return (
    <div
      onDragOver={(e) => {
        if (bloqueado) return
        e.preventDefault()
        setArrastando(true)
      }}
      onDragLeave={() => setArrastando(false)}
      onDrop={(e) => {
        e.preventDefault()
        setArrastando(false)
        if (!bloqueado) escolher(e.dataTransfer.files)
      }}
      className="contents"
    >
      <input
        ref={entrada}
        id={id}
        type="file"
        accept={ACEITOS}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => escolher(e.target.files)}
      />
      <button
        type="button"
        disabled={bloqueado}
        aria-busy={ocupado}
        onClick={() => entrada.current?.click()}
        className={`flex items-center justify-center gap-2 rounded-field border border-dashed text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 ${
          arrastando ? "border-blue bg-blue-light text-blue-text" : "border-separator-opaque text-text-secondary hover:bg-fill"
        } ${ladrilho ? "aspect-square w-full flex-col text-xs" : "min-h-16 w-full px-3"}`}
      >
        {ocupado ? (
          <SpinnerIcon size={20} className="animate-spin" aria-hidden="true" />
        ) : (
          <CameraPlusIcon size={20} aria-hidden="true" />
        )}
        {rotulo}
      </button>
    </div>
  )
}
