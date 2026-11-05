import { Suspense } from "react"
import { EditarMotorConteudo } from "@/components/motores/editar-motor-conteudo"

/** Editar dados por cima da ficha (rota interceptada): gaveta no celular, janela no desktop. */
export default function EditarMotorModal({ params }: { params: Promise<{ rastreio: string }> }) {
  return (
    <Suspense>
      <EditarMotorConteudo params={params} />
    </Suspense>
  )
}
