"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { type DestinoFoto, enviarFotosComAviso } from "@/lib/envio-fotos"
import { Dropzone } from "./dropzone"

/** Escolhe e envia na hora (ficha e O.S. aberta). Mostra o andamento e atualiza a tela ao terminar. */
export function AdicionarFotos({
  destino,
  rotulo = "Adicionar foto",
  ladrilho,
  desabilitado,
}: {
  destino: DestinoFoto
  rotulo?: string
  ladrilho?: boolean
  desabilitado?: boolean
}) {
  const router = useRouter()
  const [andamento, setAndamento] = useState<string | null>(null)

  async function enviar(arquivos: File[]) {
    setAndamento(`Enviando 1 de ${arquivos.length}...`)
    await enviarFotosComAviso(arquivos, destino, {
      aoProgredir: (feitas, total) => {
        if (feitas < total) setAndamento(`Enviando ${feitas + 1} de ${total}...`)
      },
      // Também roda quando o "Tentar novamente" do aviso consegue enviar.
      aoEnviar: (enviadas) => {
        toast.success(enviadas === 1 ? "Foto adicionada" : `${enviadas} fotos adicionadas`)
        router.refresh()
      },
    })
    setAndamento(null)
  }

  return (
    <>
      <Dropzone
        rotulo={andamento ?? rotulo}
        aoEscolher={enviar}
        ocupado={andamento !== null}
        desabilitado={desabilitado}
        ladrilho={ladrilho}
      />
      <span className="sr-only" role="status" aria-live="polite">
        {andamento ?? ""}
      </span>
    </>
  )
}
