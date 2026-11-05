import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { NovoMotorConteudo } from "@/components/motores/novo-motor-conteudo"

export const metadata: Metadata = { title: "Novo motor" }

async function Janela({ searchParams }: { searchParams: Promise<{ base?: string }> }) {
  const { base } = await searchParams
  return <NovoMotorConteudo pagina abrirBase={base === "1"} />
}

/** Acesso direto (recarregar a página ou abrir o link): mesma janela, sobre a tela de Motores. */
export default function NovoMotorPagina({ searchParams }: { searchParams: Promise<{ base?: string }> }) {
  return (
    <>
      <PageHeader titulo="Motores" />
      <Suspense>
        <Janela searchParams={searchParams} />
      </Suspense>
    </>
  )
}
