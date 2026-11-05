import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { ListaOS } from "@/components/os/lista-os"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Ordens de serviço" }

type Params = Promise<Record<string, string | string[] | undefined>>

async function Conteudo({ searchParams }: { searchParams: Params }) {
  return <ListaOS params={await searchParams} />
}

export default function OrdensServico({ searchParams }: { searchParams: Params }) {
  return (
    <div className="flex flex-col gap-[10px] md:gap-5">
      <PageHeader titulo="Ordens de serviço" />
      <Suspense
        fallback={
          <>
            <Skeleton className="h-12 w-full rounded-[16px] md:h-[52px]" />
            <Skeleton className="h-64 w-full rounded-card" />
          </>
        }
      >
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
