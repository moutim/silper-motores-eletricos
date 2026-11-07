import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { EditarMotorConteudo } from "@/components/motores/editar-motor-conteudo"
import { FichaConteudo } from "@/components/motores/ficha/ficha-conteudo"
import { EsqueletoFicha } from "@/components/layout/esqueletos"

export const metadata: Metadata = { title: "Editar dados" }

/** Acesso direto (recarregar ou abrir o link): a ficha por trás e a edição por cima. */
export default function EditarMotorPagina({ params }: { params: Promise<{ rastreio: string }> }) {
  return (
    <>
      <div className="mb-3 md:hidden">
        <PageHeader titulo="Ficha do motor" />
      </div>
      <Suspense fallback={<EsqueletoFicha />}>
        <FichaConteudo params={params} searchParams={Promise.resolve({})} />
      </Suspense>
      <Suspense>
        <EditarMotorConteudo params={params} pagina />
      </Suspense>
    </>
  )
}
