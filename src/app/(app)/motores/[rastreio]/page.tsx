import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { FichaConteudo } from "@/components/motores/ficha/ficha-conteudo"
import { EsqueletoFicha } from "@/components/layout/esqueletos"

export const metadata: Metadata = { title: "Ficha do motor" }

export default function FichaDoMotor({
  params,
  searchParams,
}: {
  params: Promise<{ rastreio: string }>
  searchParams: Promise<{ aba?: string; os?: string }>
}) {
  return (
    <div className="flex flex-col gap-[10px] md:gap-5">
      <PageHeader titulo="Ficha do motor" voltar={{ href: "/motores", rotulo: "Voltar para Motores" }} />
      <Suspense fallback={<EsqueletoFicha />}>
        <FichaConteudo params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
