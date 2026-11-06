import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { NovoMotorConteudo } from "@/components/motores/novo-motor-conteudo"

export const metadata: Metadata = { title: "Novo motor" }

/** Acesso direto (recarregar a página ou abrir o link): mesma janela, sobre a tela de Motores. */
export default function NovoMotorPagina() {
  return (
    <>
      <PageHeader titulo="Motores" />
      <Suspense>
        <NovoMotorConteudo pagina />
      </Suspense>
    </>
  )
}
