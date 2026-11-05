import { CaretLeftIcon } from "@phosphor-icons/react/ssr"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { descricaoMotor } from "@/lib/ficha"
import { nomeCurto } from "@/lib/motor-format"
import { formularioDaOS } from "@/lib/os-mapper"
import { carregarFicha } from "@/server/motores"
import { carregarOS } from "@/server/ordens"
import { DetalheOS } from "./detalhe-os"
import { OSForm } from "./os-form"

type ParamsRastreio = Promise<{ rastreio: string }>
type ParamsId = Promise<{ id: string }>

/** Nova O.S. (3.4): carrega o motor e abre o formulário. Motor desativado volta para a ficha. */
export async function NovaOSConteudo({ params, pagina }: { params: ParamsRastreio; pagina?: boolean }) {
  const { rastreio } = await params
  const dados = await carregarFicha(rastreio)
  if (!dados) notFound()
  const { motor } = dados
  if (!motor.ativo) redirect(`/motores/${encodeURIComponent(motor.rastreio)}`)
  return (
    <OSForm
      modo="nova"
      motor={{ rastreio: motor.rastreio, nome: nomeCurto(motor), descricao: descricaoMotor(motor) }}
      pagina={pagina}
    />
  )
}

/** Editar O.S.: o retrato não é refeito. Motor desativado volta para a O.S. */
export async function EditarOSConteudo({ params, pagina }: { params: ParamsId; pagina?: boolean }) {
  const { id } = await params
  const dados = await carregarOS(id)
  if (!dados) notFound()
  const { os, motor } = dados
  if (!motor.ativo) redirect(`/os/${os.id}`)
  return (
    <OSForm
      modo="editar"
      osId={os.id}
      versao={os.atualizadoEm}
      valores={formularioDaOS(os)}
      motor={{ rastreio: motor.rastreio, nome: nomeCurto(motor), descricao: descricaoMotor(motor) }}
      pagina={pagina}
    />
  )
}

/** O.S. aberta (3.5 e 3.6). */
export async function OSAbertaConteudo({ params }: { params: ParamsId }) {
  const { id } = await params
  const dados = await carregarOS(id)
  if (!dados) notFound()
  const { os, motor, bobinagensAtuais } = dados
  return (
    <div className="flex flex-col gap-3 md:gap-0">
      <Link
        href={`/motores/${encodeURIComponent(motor.rastreio)}?aba=os&os=${os.id}`}
        className="mb-2.5 hidden w-fit items-center gap-0.5 text-xs font-semibold text-orange-text md:flex"
      >
        <CaretLeftIcon size={12} weight="bold" aria-hidden="true" />
        {nomeCurto(motor)} · {motor.rastreio}
      </Link>
      <DetalheOS os={os} motor={motor} bobinagensAtuais={bobinagensAtuais} paginaPropria />
    </div>
  )
}
