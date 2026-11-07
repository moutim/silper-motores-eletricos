import type { Metadata } from "next"
import { Suspense } from "react"
import { ResultadosBusca } from "@/components/busca/resultados-busca"
import { PageHeader } from "@/components/layout/page-header"
import { EsqueletoListaPagina } from "@/components/layout/esqueletos"
import { lerParametros } from "@/lib/busca"

export const metadata: Metadata = { title: "Motores" }

type Params = Promise<Record<string, string | string[] | undefined>>

async function Resultados({ searchParams }: { searchParams: Params }) {
  return <ResultadosBusca parametros={lerParametros(await searchParams)} />
}

export default function Motores({ searchParams }: { searchParams: Params }) {
  return (
    <div className="flex flex-col gap-[10px] md:gap-5">
      <PageHeader titulo="Motores" />
      <Suspense fallback={<EsqueletoListaPagina />}>
        <Resultados searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
