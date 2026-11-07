import { notFound, redirect } from "next/navigation"
import { descricaoMotor } from "@/lib/ficha"
import { nomeCurto } from "@/lib/motor-format"
import { formularioDaOS } from "@/lib/os-mapper"
import { carregarFicha } from "@/server/motores"
import { PageHeader } from "@/components/layout/page-header"
import { paraVisao } from "@/components/fotos/painel-fotos"
import { listarFotosDoMotor } from "@/server/fotos"
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
  const fotos = (await listarFotosDoMotor(motor.id)).filter((f) => f.osId === os.id)
  return (
    <>
      <PageHeader
        titulo="Ordem de serviço"
        voltar={{
          href: `/motores/${encodeURIComponent(motor.rastreio)}?aba=os&os=${os.id}`,
          rotulo: `Voltar para o motor ${motor.rastreio}`,
        }}
      />
      <DetalheOS
        os={os}
        motor={motor}
        bobinagensAtuais={bobinagensAtuais}
        fotos={paraVisao(fotos, () => `Foto de serviço da O.S. ${os.numero}, motor ${motor.rastreio}`)}
      />
    </>
  )
}
