import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { EtiquetaConteudo } from "@/components/motores/etiqueta-conteudo"
import { FichaConteudo } from "@/components/motores/ficha/ficha-conteudo"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Etiqueta" }

type Params = Promise<{ rastreio: string }>
type Busca = Promise<{ novo?: string }>

async function Janela({ params, searchParams }: { params: Params; searchParams: Busca }) {
  const { novo } = await searchParams
  return <EtiquetaConteudo params={params} novo={novo === "1"} pagina />
}

/** Acesso direto (recarregar ou abrir o link): a ficha por trás e a etiqueta por cima. */
export default function EtiquetaPagina({ params, searchParams }: { params: Params; searchParams: Busca }) {
  return (
    <>
      <div className="mb-3 md:hidden">
        <PageHeader titulo="Ficha do motor" />
      </div>
      <Suspense fallback={<Skeleton className="h-36 w-full rounded-card" />}>
        <FichaConteudo params={params} searchParams={Promise.resolve({})} />
      </Suspense>
      <Suspense>
        <Janela params={params} searchParams={searchParams} />
      </Suspense>
    </>
  )
}
