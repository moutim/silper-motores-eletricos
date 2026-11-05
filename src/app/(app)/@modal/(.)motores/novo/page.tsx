import { Suspense } from "react"
import { NovoMotorConteudo } from "@/components/motores/novo-motor-conteudo"

async function Janela({ searchParams }: { searchParams: Promise<{ base?: string }> }) {
  const { base } = await searchParams
  return <NovoMotorConteudo abrirBase={base === "1"} />
}

/** Novo motor aberto por cima da tela de origem (rota interceptada): gaveta no celular, janela no desktop. */
export default function NovoMotorModal({ searchParams }: { searchParams: Promise<{ base?: string }> }) {
  return (
    <Suspense>
      <Janela searchParams={searchParams} />
    </Suspense>
  )
}
