"use client"

import { CaretLeftIcon, CaretRightIcon, SpinnerIcon, TrashIcon, XIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { excluirFotoAcao } from "@/server/actions/fotos"

export interface FotoView {
  id: string
  alt: string
}

/**
 * Grade de fotos (3 colunas) com visualizador ampliado (anterior, próxima, Esc fecha) e exclusão com
 * confirmação. `children` entram como último item da grade (por exemplo o ladrilho "Adicionar foto").
 */
export function GradeFotos({
  fotos,
  podeExcluir,
  children,
}: {
  fotos: FotoView[]
  podeExcluir: boolean
  children?: React.ReactNode
}) {
  const router = useRouter()
  const [escolhida, setAberta] = useState<number | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  // se a lista encolher (foto excluída), o índice continua válido; sem fotos, o visualizador fecha
  const aberta = escolhida !== null && fotos.length > 0 ? Math.min(escolhida, fotos.length - 1) : null
  const atual = aberta !== null ? fotos[aberta] : undefined

  useEffect(() => {
    if (aberta === null) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (confirmando) return
      if (e.key === "ArrowLeft") setAberta((i) => (i !== null && i > 0 ? i - 1 : i))
      if (e.key === "ArrowRight") setAberta((i) => (i !== null && i < fotos.length - 1 ? i + 1 : i))
    }
    window.addEventListener("keydown", aoTeclar)
    return () => window.removeEventListener("keydown", aoTeclar)
  }, [aberta, confirmando, fotos.length])

  async function excluir() {
    if (!atual) return
    setExcluindo(true)
    try {
      const r = await excluirFotoAcao(atual.id)
      if (r.ok) {
        toast.success("Foto excluída")
        setConfirmando(false)
        router.refresh()
      } else {
        toast.error(r.erro)
      }
    } catch {
      toast.error("Sem conexão. Tente de novo.")
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <>
      <ul className="grid grid-cols-3 gap-2 md:gap-3">
        {fotos.map((f, i) => (
          <li key={f.id}>
            <button
              type="button"
              onClick={() => setAberta(i)}
              aria-label={`Ampliar: ${f.alt}`}
              className="block aspect-square w-full overflow-hidden rounded-[12px] bg-fill outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/fotos/${f.id}`} alt={f.alt} loading="lazy" decoding="async" className="size-full object-cover" />
            </button>
          </li>
        ))}
        {children && <li>{children}</li>}
      </ul>

      <Dialog
        open={aberta !== null}
        onOpenChange={(o) => {
          if (!o) {
            setAberta(null)
            setConfirmando(false)
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[1000px] flex-col gap-0 rounded-card p-0 ring-0 sm:max-w-[1000px]"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <DialogTitle className="min-w-0 truncate text-sm font-semibold">{atual?.alt}</DialogTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs tabular-nums text-text-tertiary">
                {aberta !== null ? aberta + 1 : 0} de {fotos.length}
              </span>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setAberta(null)}
                className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-fill text-text-tertiary outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <XIcon size={16} weight="bold" aria-hidden="true" />
              </button>
            </div>
          </div>
          <DialogDescription className="sr-only">Foto ampliada. Use as setas para trocar de foto.</DialogDescription>

          <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
            {atual && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/fotos/${atual.id}`} alt={atual.alt} className="max-h-[68dvh] w-full object-contain" />
            )}
            <button
              type="button"
              aria-label="Foto anterior"
              disabled={aberta === 0}
              onClick={() => setAberta((i) => (i !== null ? i - 1 : i))}
              className="absolute left-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30"
            >
              <CaretLeftIcon size={20} weight="bold" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Próxima foto"
              disabled={aberta === fotos.length - 1}
              onClick={() => setAberta((i) => (i !== null ? i + 1 : i))}
              className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30"
            >
              <CaretRightIcon size={20} weight="bold" aria-hidden="true" />
            </button>
          </div>

          {podeExcluir && (
            <div className="flex items-center justify-end gap-2 px-4 py-3">
              {confirmando ? (
                <>
                  <p className="mr-auto text-xs text-text-tertiary">Excluir esta foto? Ela vai para a lixeira do Drive.</p>
                  <Button variant="secondary" onClick={() => setConfirmando(false)} disabled={excluindo}>
                    Cancelar
                  </Button>
                  <Button onClick={excluir} disabled={excluindo} aria-busy={excluindo}>
                    {excluindo && <SpinnerIcon className="animate-spin" aria-hidden="true" />}
                    Excluir
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setConfirmando(true)} className="text-destructive">
                  <TrashIcon aria-hidden="true" />
                  Excluir foto
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
