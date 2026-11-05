import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { CartaoCadastrar } from "@/components/motores/cartao-cadastrar"
import { ListaMotoresTemporaria } from "@/components/motores/lista-motores-temporaria"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Motores" }

export default function Motores() {
  return (
    <div className="flex flex-col gap-[10px] md:gap-5">
      <PageHeader titulo="Motores" />
      <CartaoCadastrar />
      <Suspense fallback={<Skeleton className="h-48 w-full rounded-card" />}>
        <ListaMotoresTemporaria />
      </Suspense>
    </div>
  )
}
