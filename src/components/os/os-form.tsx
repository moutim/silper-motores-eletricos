"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { SpinnerIcon } from "@phosphor-icons/react"
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
import { enviarVariasFotos } from "@/lib/envio-fotos"
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
          const env = await enviarVariasFotos(fotos, { rastreio: motor.rastreio, tipo: "SERVICO", osId: r.id })
          setEnviandoFotos(false)
          if (env.falhas.length > 0) {
            toast.warning(`A O.S. foi salva, mas ${env.falhas.length} foto(s) não foram enviadas. Adicione pela O.S.`)
          }
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
      tituloExtra={
        <Badge className="bg-orange-light text-orange-text">
          {motor.rastreio} · {motor.nome}
        </Badge>
      }
    >
      <FormProvider {...form}>
        {/* Celular: cartão do motor vinculado. No desktop o selo fica no título. */}
        <div className="mb-4 rounded-[16px] bg-bg p-3 md:hidden">
          <p className="text-[17px] font-bold leading-[1.15] tracking-[-0.02em]">{motor.nome}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge className="bg-orange-light text-orange-text">{motor.rastreio}</Badge>
            <span className="min-w-0 truncate text-xs text-text-tertiary">{motor.descricao}</span>
          </div>
        </div>

        <form
          id={ID_FORM}
          noValidate
          onSubmit={(e) => void salvar(e)}
          className="grid grid-cols-1 gap-3 md:grid-cols-6"
        >
          <CampoTexto<OSFormValues>
            name="numero"
            label="Número da O.S."
            obrigatorio
            placeholder="4821"
            dica="Você informa o número. Ele pode se repetir."
            maxLength={20}
            className="order-1 md:col-span-2"
          />
          <CampoData name="dataEntrada" label="Data de entrada" className="order-2 md:col-span-2" />
          <CampoMoeda label="Valor da nota" className="order-5 md:order-3 md:col-span-2" />
          <CampoTextoLongo name="defeito" label="Defeito relatado" placeholder="Não parte" className="order-3 md:order-4 md:col-span-3" />
          <CampoTextoLongo
            name="servicoExecutado"
            label="Serviço executado"
            placeholder="Rebobinado completo"
            className="order-4 md:order-5 md:col-span-3"
          />
          <CampoTextoLongo name="observacoes" label="Observações" rows={3} className="order-6 md:col-span-6" />

          {!editar && (
            <section className="order-7 flex flex-col gap-2 md:col-span-6" aria-label="Fotos da O.S.">
              <TituloSecao>Fotos da O.S. (opcional)</TituloSecao>
              <SeletorFotos rotulo="Adicionar fotos da O.S." arquivos={fotos} aoMudar={setFotos} desabilitado={salvando} />
            </section>
          )}
        </form>
      </FormProvider>
    </GavetaOuJanela>
  )
}
