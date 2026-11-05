"use client"

import { DotsThreeIcon, SpinnerIcon, TagIcon, ToggleLeftIcon, ToggleRightIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { alterarAtivoMotor } from "@/server/actions/motores"

/** Menu "mais" da ficha: Gerar etiqueta e Desativar/Reativar motor (RN-17), com confirmação. */
export function MenuMaisMotor({ rastreio, ativo }: { rastreio: string; ativo: boolean }) {
  const router = useRouter()
  const [confirmar, setConfirmar] = useState(false)
  const [salvando, setSalvando] = useState(false)

  async function alternar() {
    setSalvando(true)
    try {
      const r = await alterarAtivoMotor(rastreio, !ativo)
      if (r.ok) {
        toast.success(ativo ? "Motor desativado" : "Motor reativado")
        setConfirmar(false)
        router.refresh()
      } else {
        toast.error(r.erro, { action: { label: "Tentar de novo", onClick: () => void alternar() } })
      }
    } catch {
      toast.error("Sem conexão. Verifique a internet e tente de novo.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Mais ações" className="size-[42px] shrink-0">
            <DotsThreeIcon size={22} weight="bold" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuItem onSelect={() => router.push(`/motores/${encodeURIComponent(rastreio)}/etiqueta`)}>
            <TagIcon aria-hidden="true" />
            Gerar etiqueta
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setConfirmar(true)} className={ativo ? "text-destructive" : undefined}>
            {ativo ? <ToggleLeftIcon aria-hidden="true" /> : <ToggleRightIcon aria-hidden="true" />}
            {ativo ? "Desativar motor" : "Reativar motor"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmar} onOpenChange={setConfirmar}>
        <DialogContent showCloseButton={false} className="rounded-card sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-bold">
              {ativo ? "Desativar este motor?" : "Reativar este motor?"}
            </DialogTitle>
            <DialogDescription>
              {ativo
                ? "Ele sai da busca e das listas. O histórico, as O.S. e o rastreio continuam guardados, e o rastreio não volta a ser usado."
                : "Ele volta para a busca e para as listas."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setConfirmar(false)} disabled={salvando}>
              Cancelar
            </Button>
            <Button onClick={alternar} disabled={salvando} aria-busy={salvando}>
              {salvando && <SpinnerIcon className="animate-spin" aria-hidden="true" />}
              {ativo ? "Desativar" : "Reativar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
