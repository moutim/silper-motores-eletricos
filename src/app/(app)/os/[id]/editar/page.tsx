import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { EditarOSConteudo, OSAbertaConteudo } from "@/components/os/os-conteudos"
import { EsqueletoOSAberta } from "@/components/layout/esqueletos"

export const metadata: Metadata = { title: "Editar O.S." }

/** Acesso direto: a O.S. por trás e a edição por cima. */
export default function EditarOSPagina({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <div className="mb-3 md:hidden">
        <PageHeader titulo="Ordem de serviço" />
      </div>
      <Suspense fallback={<EsqueletoOSAberta />}>
        <OSAbertaConteudo params={params} />
      </Suspense>
      <Suspense>
        <EditarOSConteudo params={params} pagina />
      </Suspense>
    </>
  )
}
