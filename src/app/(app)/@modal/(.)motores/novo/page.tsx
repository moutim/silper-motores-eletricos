import { Suspense } from "react"
import { NovoMotorConteudo } from "@/components/motores/novo-motor-conteudo"

/** Novo motor aberto por cima da tela de origem (rota interceptada): gaveta no celular, janela no desktop. */
export default function NovoMotorModal() {
  return (
    <Suspense>
      <NovoMotorConteudo />
    </Suspense>
  )
}
