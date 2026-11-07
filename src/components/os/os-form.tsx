"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { EngineIcon, SpinnerIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "sonner"
import { GavetaOuJanela } from "@/components/layout/gaveta-ou-janela"
import { CampoTexto, TituloSecao } from "@/components/motores/campos"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SeletorFotos } from "@/components/fotos/seletor-fotos"
import { useIsMobile } from "@/hooks/use-mobile"
import { enviarFotosComAviso } from "@/lib/envio-fotos"
import { type OSFormValues, osFormSchema, osValoresIniciais } from "@/lib/os-schema"
import { criarOSAcao, editarOSAcao } from "@/server/actions/ordens"
import { CampoData, CampoMoeda, CampoTextoLongo } from "./campos-os"

const ID_FORM = "os-form"

export interface MotorDaOS {
  rastreio: string
  nome: string
  descricao: string
}

type Props = { motor: MotorDaOS; pagina?: boolean } & (
  | { modo: "nova" }
  | { modo: "editar"; osId: string; versao: string; valores: OSFormValues }
)

/**
 * Nova O.S. (3.4) e Editar O.S. Janela de 600 px no desktop, gaveta no celular. O número é digitado e
 * nunca verificado quanto a duplicidade (RN-07, RN-08). Fotos entram na Fase 5.
 */
export function OSForm(props: Props) {
  const editar = props.modo === "editar"
  const router = useRouter()
  const celular = useIsMobile()
  const form = useForm<OSFormValues>({
    resolver: zodResolver(osFormSchema),
    defaultValues: props.modo === "editar" ? props.valores : osValoresIniciais(),
    mode: "onTouched",
  })
  const [salvando, setSalvando] = useState(false)
  /** Fotos escolhidas: enviadas depois de salvar, quando a O.S. já existe. */
  const [fotos, setFotos] = useState<File[]>([])
  const [enviandoFotos, setEnviandoFotos] = useState(false)
  const { motor } = props
  const enc = encodeURIComponent(motor.rastreio)

  const salvar = form.handleSubmit(async (valores) => {
    setSalvando(true)
    const tentarDeNovo = { action: { label: "Tentar de novo", onClick: () => void salvar() } }
    try {
      if (props.modo === "editar") {
        const r = await editarOSAcao(props.osId, valores, props.versao)
        if (r.ok) {
          toast.success(`O.S. ${r.numero} atualizada`)
          if (props.pagina) router.push(`/os/${props.osId}`)
          else router.back()
          router.refresh()
        } else if (r.conflito) {
          toast.error(r.erro, { action: { label: "Recarregar", onClick: () => router.refresh() } })
        } else {
          toast.error(r.erro, tentarDeNovo)
        }
        return
      }
      const r = await criarOSAcao(motor.rastreio, valores)
      if (r.ok) {
        toast.success(`O.S. ${r.numero} registrada`)
        if (fotos.length > 0) {
          setEnviandoFotos(true)
          await enviarFotosComAviso(
            fotos,
            { rastreio: motor.rastreio, tipo: "SERVICO", osId: r.id },
            { contexto: "A O.S. foi salva. ", aoEnviar: () => router.refresh() },
          )
          setEnviandoFotos(false)
        }
        setFotos([])
        form.reset(osValoresIniciais()) // o Next preserva o estado da rota interceptada ao fechar
        router.replace(`/motores/${enc}?aba=os&os=${r.id}`)
        router.refresh()
      } else {
        toast.error(r.erro, tentarDeNovo)
      }
    } catch {
      toast.error("Sem conexão. Verifique a internet e tente de novo.", tentarDeNovo)
    } finally {
      setSalvando(false)
    }
  })

  const aoFechar = () => {
    if (props.pagina) router.push(editar ? `/os/${props.osId}` : `/motores/${enc}?aba=os`)
    else router.back()
  }

  const rotulo = editar ? "Salvar alterações" : "Salvar O.S."
  const rodape = (
    <Button type="submit" form={ID_FORM} disabled={salvando} aria-busy={salvando} className={celular ? "flex-1" : undefined}>
      {salvando && <SpinnerIcon className="animate-spin" aria-hidden="true" />}
      {enviandoFotos ? "Enviando fotos..." : salvando ? "Salvando..." : rotulo}
    </Button>
  )

  return (
    <GavetaOuJanela
      titulo={editar ? "Editar O.S." : "Nova O.S."}
      descricao={`${editar ? "Edição" : "Registro"} de uma ordem de serviço do motor ${motor.rastreio}.`}
      aoFechar={aoFechar}
      rodape={rodape}
      larguraJanela={600}
      alturaFixa={false}
    >
      <FormProvider {...form}>
        {/* Motor ao qual a O.S. fica atrelada: no corpo, para o topo ter só o título e o X. */}
        <div className="mb-5 flex items-center gap-3 rounded-[16px] bg-bg px-4 py-3">
          <span
            className="flex size-[30px] shrink-0 items-center justify-center rounded-[8px] bg-[#3A55B6] text-white"
            aria-hidden="true"
          >
            <EngineIcon size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{motor.nome}</p>
            <p className="truncate text-xs text-text-tertiary">{motor.descricao}</p>
          </div>
          <Badge className="shrink-0 bg-orange-light text-orange-text">{motor.rastreio}</Badge>
        </div>

        <form id={ID_FORM} noValidate onSubmit={(e) => void salvar(e)} className="flex flex-col gap-5">
          <section className="flex flex-col gap-3" aria-label="Dados da O.S.">
            <TituloSecao>Dados da O.S.</TituloSecao>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <CampoTexto<OSFormValues>
                name="numero"
                label="Número da O.S."
                obrigatorio
                placeholder="4821"
                dica="Pode se repetir."
                maxLength={20}
                className="col-span-2 md:col-span-1"
              />
              <CampoData name="dataEntrada" label="Data de entrada" />
              <CampoMoeda label="Valor da nota" />
            </div>
          </section>

          <section className="flex flex-col gap-3" aria-label="Serviço">
            <TituloSecao>Serviço</TituloSecao>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <CampoTextoLongo name="defeito" label="Defeito relatado" placeholder="Não parte" rows={3} />
              <CampoTextoLongo name="servicoExecutado" label="Serviço executado" placeholder="Rebobinado completo" rows={3} />
              <CampoTextoLongo name="observacoes" label="Observações" rows={2} className="md:col-span-2" />
            </div>
          </section>

          {!editar && (
            <section className="flex flex-col gap-3" aria-label="Fotos da O.S.">
              <TituloSecao>Fotos da O.S. (opcional)</TituloSecao>
              <SeletorFotos rotulo="Adicionar fotos da O.S." arquivos={fotos} aoMudar={setFotos} desabilitado={salvando} />
            </section>
          )}
        </form>
      </FormProvider>
    </GavetaOuJanela>
  )
}
