"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { InfoIcon, SpinnerIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { GavetaOuJanela } from "@/components/layout/gaveta-ou-janela"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import { config } from "@/lib/config"
import { type MotorFormValues, motorFormSchema, valoresIniciaisNovo } from "@/lib/motor-schema"
import { normalizarRastreio, validarRastreioDigitado } from "@/lib/rastreio"
import { SeletorFotos } from "@/components/fotos/seletor-fotos"
import { enviarFotosComAviso } from "@/lib/envio-fotos"
import { cadastrarMotor, clientesAcao, editarMotorAcao, previsaoRastreioAcao, verificarRastreio } from "@/server/actions/motores"
import { CampoCliente, CampoLista, CampoPotencia, CampoTexto, TituloSecao } from "./campos"
import { type BaseEscolhida, EscolherBase } from "./escolher-base"
import { GrupoBobinagem } from "./grupo-bobinagem"
import { Segmentado } from "./segmentado"

const ID_FORM = "motor-form"

/** O número previsto chega depois: o formulário abre na hora e o servidor decide o número ao salvar. */
function NumeroPrevisto() {
  const [valor, setValor] = useState<string | null | undefined>(undefined)
  useEffect(() => {
    let ativo = true
    previsaoRastreioAcao().then((v) => ativo && setValor(v))
    return () => {
      ativo = false
    }
  }, [])
  if (valor === undefined) return <span className="text-text-tertiary">Calculando...</span>
  return <>{valor ?? "Definido ao salvar"}</>
}

type Props = { pagina?: boolean } & (
  | { modo: "novo"; abrirBase?: boolean }
  | { modo: "editar"; rastreio: string; versao: string; valores: MotorFormValues }
)

/**
 * Formulário do motor, no celular (gaveta) e no desktop (janela). Serve ao cadastro (1.2 a 1.8) e
 * à edição (3.8). Os dois aparelhos mostram os mesmos campos: no celular, Dados gerais, Bobinagem e
 * Fotos vêm empilhados numa só rolagem, com um único botão de salvar. Na edição o rastreio é fixo.
 */
export function MotorForm(props: Props) {
  const editar = props.modo === "editar"
  const router = useRouter()
  const celular = useIsMobile()
  const form = useForm<MotorFormValues>({
    resolver: zodResolver(motorFormSchema),
    defaultValues: props.modo === "editar" ? props.valores : valoresIniciaisNovo(),
    mode: "onTouched",
  })
  const { control, register, formState, setError, clearErrors, getValues } = form
  const modo = useWatch({ control, name: "rastreioModo" })
  const tipo = useWatch({ control, name: "tipoMotor" })
  const rastreioDigitado = useWatch({ control, name: "rastreio" })

  /** Clientes já cadastrados (só no cadastro). Chegam depois do formulário aberto; até lá o campo é de texto. */
  const [clientes, setClientes] = useState<string[]>([])
  useEffect(() => {
    if (editar) return
    let ativo = true
    clientesAcao().then((c) => ativo && setClientes(c))
    return () => {
      ativo = false
    }
  }, [editar])

  const [salvando, setSalvando] = useState(false)
  const [verificando, setVerificando] = useState(false)
  /** Fotos escolhidas no cadastro: são enviadas depois de salvar, quando o motor já existe. */
  const [fotosEquipamento, setFotosEquipamento] = useState<File[]>([])
  const [fotosEsquema, setFotosEsquema] = useState<File[]>([])
  const [enviandoFotos, setEnviandoFotos] = useState(false)
  /** Chave do último rastreio digitado que o servidor disse estar em uso. Bloqueia o Salvar. */
  const [emUso, setEmUso] = useState<string | null>(null)
  /** Motor-base escolhido (1.3 e 1.4): os dados já estão no formulário; aqui fica só o vínculo. */
  const [base, setBase] = useState<BaseEscolhida | null>(null)

  const bloqueado = !editar && modo === "MANUAL" && emUso !== null && normalizarRastreio(rastreioDigitado) === emUso
  const destinoPagina = props.modo === "editar" ? `/motores/${encodeURIComponent(props.rastreio)}` : "/motores"
  const aoFechar = () => (props.pagina ? router.push(destinoPagina) : router.back())

  async function conferirRastreio(): Promise<boolean> {
    const valor = getValues("rastreio")
    const local = validarRastreioDigitado(valor)
    if (!local.ok) {
      setError("rastreio", { type: "validate", message: local.erro })
      return false
    }
    setVerificando(true)
    try {
      const r = await verificarRastreio(local.valor)
      if (r.ok) {
        clearErrors("rastreio")
        setEmUso(null)
        return true
      }
      setError("rastreio", { type: "server", message: r.erro })
      if (r.motivo === "EM_USO") setEmUso(normalizarRastreio(local.valor))
      return false
    } catch {
      setError("rastreio", { type: "server", message: "Não foi possível verificar. Tente de novo." })
      return false
    } finally {
      setVerificando(false)
    }
  }

  /** Copia dados técnicos e bobinagem do motor-base; mantém rastreio e cliente já digitados (RN-10). */
  function usarBase(escolhida: BaseEscolhida, valores: MotorFormValues) {
    const atual = getValues()
    form.reset({
      ...valores,
      rastreioModo: atual.rastreioModo,
      rastreio: atual.rastreio,
      clienteNome: atual.clienteNome,
    })
    setBase(escolhida)
    toast.success(`Dados copiados de ${escolhida.rastreio}. Preencha o cliente.`)
  }

  const salvar = form.handleSubmit(
    async (valores) => {
      if (props.modo === "novo" && valores.rastreioModo === "MANUAL" && !(await conferirRastreio())) {
        return
      }
      setSalvando(true)
      const tentarDeNovo = { action: { label: "Tentar de novo", onClick: () => void salvar() } }
      try {
        if (props.modo === "editar") {
          const r = await editarMotorAcao(props.rastreio, valores, props.versao)
          if (r.ok) {
            toast.success("Alterações salvas")
            aoFechar()
            router.refresh()
          } else if (r.conflito) {
            toast.error(r.erro, { action: { label: "Recarregar", onClick: () => router.refresh() } })
          } else {
            toast.error(r.erro, tentarDeNovo)
          }
          return
        }
        const r = await cadastrarMotor(valores, base?.id ?? null)
        if (r.ok) {
          toast.success(`Motor cadastrado: ${r.rastreio}`)
          if (fotosEquipamento.length + fotosEsquema.length > 0) {
            setEnviandoFotos(true)
            const aviso = { contexto: "O motor foi salvo. ", aoEnviar: () => router.refresh() }
            await enviarFotosComAviso(fotosEquipamento, { rastreio: r.rastreio, tipo: "EQUIPAMENTO" }, aviso)
            await enviarFotosComAviso(fotosEsquema, { rastreio: r.rastreio, tipo: "ESQUEMA" }, aviso)
            setEnviandoFotos(false)
          }
          // O Next preserva o estado da rota interceptada ao fechar: limpa para o próximo cadastro.
          setFotosEquipamento([])
          setFotosEsquema([])
          form.reset(valoresIniciaisNovo())
          setBase(null)
          setEmUso(null)
          // Conclui o cadastro abrindo a etiqueta (1.9). `replace`: fechar a etiqueta volta para onde o cadastro começou.
          router.replace(`/motores/${encodeURIComponent(r.rastreio)}/etiqueta?novo=1`)
          router.refresh()
        } else if (r.campo === "rastreio") {
          setError("rastreio", { type: "server", message: r.erro })
          setEmUso(normalizarRastreio(valores.rastreio))
        } else {
          toast.error(r.erro, tentarDeNovo)
        }
      } catch {
        toast.error("Sem conexão. Verifique a internet e tente de novo.", tentarDeNovo)
      } finally {
        setSalvando(false)
      }
    },
  )

  const ocupado = salvando || verificando
  const rotuloSalvar = editar
    ? salvando
      ? "Salvando..."
      : "Salvar alterações"
    : enviandoFotos
      ? "Enviando fotos..."
      : salvando
        ? "Salvando..."
        : "Salvar motor"
  const botaoSalvar = (
    <Button
      type="submit"
      form={ID_FORM}
      disabled={ocupado || bloqueado}
      aria-busy={salvando}
      className={celular ? "flex-1" : undefined}
    >
      {salvando && <SpinnerIcon className="animate-spin" aria-hidden="true" />}
      {rotuloSalvar}
    </Button>
  )

  const rodape = botaoSalvar

  const erroRastreio = formState.errors.rastreio?.message
  const titulo = editar ? "Editar dados" : "Novo motor"

  return (
    <GavetaOuJanela
      titulo={titulo}
      descricao={
        editar
          ? "Edição dos dados gerais e da bobinagem do motor. O rastreio não muda."
          : "Cadastro de um motor novo: rastreio, dados gerais e bobinagem."
      }
      aoFechar={aoFechar}
      rodape={rodape}
    >
      <FormProvider {...form}>
        <form
          id={ID_FORM}
          noValidate
          onSubmit={(e) => void salvar(e)}
          className="flex flex-col gap-5 md:gap-6"
        >
          {/* Faixa de cima (desktop): rastreio à esquerda, motor-base à direita. No celular tudo empilha. */}
          <div className="flex flex-col gap-5 md:gap-4">
            {props.modo === "editar" ? (
              <div className="flex items-center justify-between gap-3 rounded-[16px] bg-bg px-4 py-3">
                <span className="text-sm font-semibold">Rastreio</span>
                <span className="flex items-center gap-2">
                  <Badge className="bg-orange-light text-orange-text">{props.rastreio}</Badge>
                  <span className="text-xs text-text-tertiary">não editável</span>
                </span>
              </div>
            ) : (
              <>
                <section className="flex flex-col gap-3 md:grid md:grid-cols-2 md:items-center md:gap-4" aria-label="Rastreio">
                  <Controller
                    control={control}
                    name="rastreioModo"
                    render={({ field }) => (
                      <Segmentado
                        rotulo="Tipo de rastreio"
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v)
                          clearErrors("rastreio")
                        }}
                        opcoes={[
                          { valor: "AUTOMATICO", rotulo: "Rastreio automático" },
                          { valor: "MANUAL", rotulo: "Digitar rastreio" },
                        ]}
                      />
                    )}
                  />

                  {modo === "AUTOMATICO" ? (
                    <div className="flex items-center justify-between gap-4 rounded-[16px] bg-bg px-4 py-3 md:py-2">
                      <div>
                        <p className="text-xs font-semibold text-text-tertiary">Número previsto</p>
                        <p className="text-xl font-bold tabular-nums" aria-live="polite">
                          {props.modo === "novo" && <NumeroPrevisto />}
                        </p>
                      </div>
                      <p className="max-w-[190px] text-right text-xs text-text-tertiary">
                        Único e nunca reutilizado. Duplicados são bloqueados.
                      </p>
                    </div>
                  ) : (
                    <Field data-invalid={!!erroRastreio}>
                      <FieldLabel htmlFor="campo-rastreio" className="text-xs font-semibold text-text-tertiary">
                        Digite o rastreio
                        <span aria-hidden="true"> *</span>
                      </FieldLabel>
                      <Input
                        id="campo-rastreio"
                        autoComplete="off"
                        autoCapitalize="characters"
                        placeholder={`${config.rastreio.prefixo}000130`}
                        aria-required
                        aria-invalid={!!erroRastreio}
                        aria-describedby="campo-rastreio-erro"
                        {...register("rastreio", { onChange: () => clearErrors("rastreio") })}
                        onBlur={(e) => {
                          void register("rastreio").onBlur(e)
                          if (e.target.value.trim() !== "") void conferirRastreio()
                        }}
                      />
                      <div id="campo-rastreio-erro" aria-live="polite">
                        {erroRastreio ? (
                          <FieldError>{erroRastreio}</FieldError>
                        ) : verificando ? (
                          <p className="text-xs text-text-tertiary">Verificando...</p>
                        ) : null}
                      </div>
                    </Field>
                  )}
                </section>

                <EscolherBase
                  base={base}
                  aoUsar={usarBase}
                  aoRemover={() => setBase(null)}
                  abrirInicialmente={props.modo === "novo" && !!props.abrirBase}
                  desabilitado={salvando}
                />
              </>
            )}

          </div>

          <div className="flex flex-col gap-5 md:gap-4">
          <section className="flex flex-col gap-3" aria-label="Dados gerais">
              <TituloSecao>Dados gerais</TituloSecao>
              {/* Grade de 6 colunas: celular 2 por linha (3 em Item/Pacote/Diâmetro); desktop 3 por linha, sem células vazias. */}
              <div className="grid grid-cols-6 gap-3 md:grid-cols-12">
                {editar ? (
                  <CampoTexto name="clienteNome" label="Cliente" obrigatorio className="col-span-full md:col-span-6" />
                ) : (
                  <CampoCliente clientes={clientes} />
                )}
                <CampoTexto name="marca" label="Marca" placeholder="WEG" className="col-span-3 md:col-span-3" />
                <CampoTexto name="modelo" label="Modelo" placeholder="W22" className="col-span-3 md:col-span-3" />
                <CampoTexto name="tipoEquipamento" label="Tipo de equipamento" className="col-span-full md:col-span-3" />
                <div className="col-span-3 md:col-span-3">
                  <CampoPotencia />
                </div>
                <div className="col-span-3 md:col-span-3">
                  <CampoLista name="tensao" label="Tensão" opcoes={config.listas.tensoes} sufixo="V" />
                </div>
                <CampoTexto name="corrente" label="Corrente (A)" inputMode="decimal" placeholder="13,8" className="col-span-3 md:col-span-3" />
                <div className="col-span-3 md:col-span-3">
                  <CampoLista name="rpm" label="RPM" opcoes={config.listas.rpms} sufixo="RPM" />
                </div>
                <CampoTexto name="fatorServico" label="F.S." placeholder="1,15" className="col-span-3 md:col-span-3" />
                <CampoTexto name="item" label="Item" className="col-span-2" />
                <CampoTexto name="pacote" label="Pacote" className="col-span-2" />
                <CampoTexto name="diametro" label="Diâmetro" className="col-span-2" />
              </div>
            </section>

          {/* Coluna da direita: bobinagem e fotos (no celular vem logo abaixo) */}
          <div className="flex flex-col gap-5 md:gap-4">
            <section className="flex flex-col gap-3 md:grid md:grid-cols-[calc(25%-9px)_minmax(0,1fr)] md:items-start md:gap-x-3" aria-label="Bobinagem">
              <div className="md:col-span-2"><TituloSecao>Bobinagem</TituloSecao></div>
              <Field className="md:col-start-1 md:row-start-2">
                <FieldLabel className="text-xs font-semibold text-text-tertiary max-md:sr-only">Tipo do motor</FieldLabel>
                <Controller
                  control={control}
                  name="tipoMotor"
                  render={({ field }) => (
                    <Segmentado
                      rotulo="Tipo do motor"
                      value={field.value}
                      onValueChange={field.onChange}
                      opcoes={[
                        { valor: "TRIFASICO", rotulo: "Trifásico" },
                        { valor: "MONOFASICO", rotulo: "Monofásico" },
                      ]}
                    />
                  )}
                />
              </Field>
              <div className="flex flex-col gap-3 md:col-start-2 md:row-start-2">
              {editar && (
                <Alert className="border-0 bg-orange-light text-orange-text">
                  <InfoIcon size={18} aria-hidden="true" />
                  <AlertDescription className="text-orange-text">
                    Ao trocar o tipo, os dados da bobina auxiliar serão criados ou descartados.
                  </AlertDescription>
                </Alert>
              )}
              {tipo === "TRIFASICO" ? (
                <GrupoBobinagem grupo="trabalho" />
              ) : (
                <>
                  <p className="text-xs text-text-tertiary">Monofásico: dados separados para cada bobina.</p>
                  <GrupoBobinagem grupo="trabalho" titulo="Bobina de trabalho" />
                  <GrupoBobinagem grupo="auxiliar" titulo="Bobina auxiliar" />
                </>
              )}
              </div>
            </section>

            {!editar && (
              <section className="flex flex-col gap-3 md:grid md:grid-cols-[calc(25%-9px)_minmax(0,1fr)] md:items-center md:gap-x-3" aria-label="Fotos">
                <TituloSecao>Fotos (opcional)</TituloSecao>
                <div className="grid gap-3 md:grid-cols-2">
                <SeletorFotos
                  rotulo="Foto do equipamento"
                  arquivos={fotosEquipamento}
                  aoMudar={setFotosEquipamento}
                  desabilitado={salvando}
                />
                <SeletorFotos
                  rotulo="Foto do esquema de ligação"
                  arquivos={fotosEsquema}
                  aoMudar={setFotosEsquema}
                  desabilitado={salvando}
                />
                </div>
              </section>
            )}
          </div>
          </div>
        </form>
      </FormProvider>
    </GavetaOuJanela>
  )
}
