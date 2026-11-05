import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { FichaConteudo } from "@/components/motores/ficha/ficha-conteudo"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Ficha do motor" }

export default function FichaDoMotor({
  params,
  searchParams,
}: {
  params: Promise<{ rastreio: string }>
  searchParams: Promise<{ aba?: string }>
}) {
  return (
    <>
      {/* No celular o título é "Ficha do motor"; no desktop o nome do motor (h1) fica no cartão. */}
      <div className="mb-3 md:hidden">
        <PageHeader titulo="Ficha do motor" />
      </div>
      <Suspense fallback={<Skeleton className="h-36 w-full rounded-card" />}>
        <FichaConteudo params={params} searchParams={searchParams} />
      </Suspense>
    </>
  )
}
