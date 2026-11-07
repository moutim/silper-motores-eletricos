import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { FichaConteudo } from "@/components/motores/ficha/ficha-conteudo"
import { NovaOSConteudo } from "@/components/os/os-conteudos"
import { EsqueletoFicha } from "@/components/layout/esqueletos"

export const metadata: Metadata = { title: "Nova O.S." }

/** Acesso direto (recarregar ou abrir o link): a ficha (aba O.S.) por trás e o formulário por cima. */
export default function NovaOSPagina({ params }: { params: Promise<{ rastreio: string }> }) {
  return (
    <>
      <div className="mb-3 md:hidden">
        <PageHeader titulo="Ficha do motor" />
      </div>
      <Suspense fallback={<EsqueletoFicha aba="os" />}>
        <FichaConteudo params={params} searchParams={Promise.resolve({ aba: "os" })} />
      </Suspense>
      <Suspense>
        <NovaOSConteudo params={params} pagina />
      </Suspense>
    </>
  )
}
