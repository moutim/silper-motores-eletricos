import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { OSAbertaConteudo } from "@/components/os/os-conteudos"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Ordem de serviço" }

export default function OSAberta({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <div className="mb-3 md:hidden">
        <PageHeader titulo="Ordem de serviço" />
      </div>
      <Suspense fallback={<Skeleton className="h-36 w-full rounded-card" />}>
        <OSAbertaConteudo params={params} />
      </Suspense>
    </>
  )
}
