import type { Metadata } from "next"
import { Suspense } from "react"
import { ResultadosBusca } from "@/components/busca/resultados-busca"
import { PageHeader } from "@/components/layout/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { lerParametros } from "@/lib/busca"

export const metadata: Metadata = { title: "Motores" }

type Params = Promise<Record<string, string | string[] | undefined>>

async function Resultados({ searchParams }: { searchParams: Params }) {
  return <ResultadosBusca parametros={lerParametros(await searchParams)} />
}

function Esqueleto() {
  return (
    <>
      <Skeleton className="h-12 w-full rounded-[16px] md:h-[52px]" />
      <Skeleton className="h-[68px] w-full rounded-card" />
      <Skeleton className="h-48 w-full rounded-card" />
    </>
  )
}

export default function Motores({ searchParams }: { searchParams: Params }) {
  return (
    <div className="flex flex-col gap-[10px] md:gap-5">
      <PageHeader titulo="Motores" />
      <Suspense fallback={<Esqueleto />}>
        <Resultados searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
