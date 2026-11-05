import { Suspense } from "react"
import { NovaOSConteudo } from "@/components/os/os-conteudos"

/** Nova O.S. por cima da ficha (rota interceptada): gaveta no celular, janela de 600 px no desktop. */
export default function NovaOSModal({ params }: { params: Promise<{ rastreio: string }> }) {
  return (
    <Suspense>
      <NovaOSConteudo params={params} />
    </Suspense>
  )
}
