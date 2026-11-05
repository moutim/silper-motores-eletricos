import { Suspense } from "react"
import { EtiquetaConteudo } from "@/components/motores/etiqueta-conteudo"

type Params = Promise<{ rastreio: string }>
type Busca = Promise<{ novo?: string }>

async function Conteudo({ params, searchParams }: { params: Params; searchParams: Busca }) {
  const { novo } = await searchParams
  return <EtiquetaConteudo params={params} novo={novo === "1"} />
}

/** Etiqueta por cima da tela de origem (rota interceptada): gaveta no celular, janela no desktop. */
export default function EtiquetaModal({ params, searchParams }: { params: Params; searchParams: Busca }) {
  return (
    <Suspense>
      <Conteudo params={params} searchParams={searchParams} />
    </Suspense>
  )
}
