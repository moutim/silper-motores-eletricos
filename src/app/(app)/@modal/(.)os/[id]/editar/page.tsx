import { Suspense } from "react"
import { EditarOSConteudo } from "@/components/os/os-conteudos"

/** Editar O.S. por cima da O.S. aberta (rota interceptada). */
export default function EditarOSModal({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <EditarOSConteudo params={params} />
    </Suspense>
  )
}
