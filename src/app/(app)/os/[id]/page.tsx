import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { OSAbertaConteudo } from "@/components/os/os-conteudos"
import { EsqueletoOSAberta } from "@/components/layout/esqueletos"

export const metadata: Metadata = { title: "Ordem de serviço" }

export default function OSAberta({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="flex flex-col gap-[10px] md:gap-5">
      <Suspense
        fallback={
          <>
            <PageHeader titulo="Ordem de serviço" voltar={{ href: "/os", rotulo: "Voltar para O.S." }} />
            <EsqueletoOSAberta />
          </>
        }
      >
        <OSAbertaConteudo params={params} />
      </Suspense>
    </div>
  )
}
