import { notFound, redirect } from "next/navigation"
import { formularioDoMotor } from "@/lib/motor-edicao"
import { carregarFicha } from "@/server/motores"
import { MotorForm } from "./motor-form"

/** Edição (3.8): carrega o motor e abre o formulário. Motor desativado volta para a ficha. */
export async function EditarMotorConteudo({
  params,
  pagina,
}: {
  params: Promise<{ rastreio: string }>
  pagina?: boolean
}) {
  const { rastreio } = await params
  const dados = await carregarFicha(rastreio)
  if (!dados) notFound()
  const { motor, bobinagens } = dados
  if (!motor.ativo) redirect(`/motores/${encodeURIComponent(motor.rastreio)}`)

  return (
    <MotorForm
      modo="editar"
      rastreio={motor.rastreio}
      versao={motor.atualizadoEm}
      valores={formularioDoMotor(motor, bobinagens)}
      pagina={pagina}
    />
  )
}
