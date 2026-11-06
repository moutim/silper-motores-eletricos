"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { InfoIcon, SpinnerIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { Suspense, use, useState } from "react"
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
import { type MotorFormValues, motorFormSchema, valoresIniciais } from "@/lib/motor-schema"
import { normalizarRastreio, validarRastreioDigitado } from "@/lib/rastreio"
import { SeletorFotos } from "@/components/fotos/seletor-fotos"
import { enviarVariasFotos } from "@/lib/envio-fotos"
import { cadastrarMotor, editarMotorAcao, verificarRastreio } from "@/server/actions/motores"
import { CampoLista, CampoPotencia, CampoTexto, TituloSecao } from "./campos"
import { type BaseEscolhida, EscolherBase } from "./escolher-base"
import { GrupoBobinagem } from "./grupo-bobinagem"
import { Segmentado } from "./segmentado"

const ID_FORM = "motor-form"

/** O número previsto chega depois: o formulário abre na hora e o servidor decide o número ao salvar. */
function NumeroPrevisto({ previsto }: { previsto: Promise<string | null> }) {
  return <>{use(previsto) ?? "Definido ao salvar"}</>
}

/** Campos do passo 1 no celular (rastreio e dados gerais). */
const CAMPOS_PASSO_1 = [
  "rastreio", "clienteNome", "marca", "modelo", "tipoEquipamento", "potenciaValor",
  "tensao", "corrente", "rpm", "fatorServico", "item", "pacote", "diametro",
] as const

type Props = { pagina?: boolean } & (
  | { modo: "novo"; previsto: Promise<string | null>; abrirBase?: boolean }
  | { modo: "editar"; rastreio: string; versao: string; valores: MotorFormValues }
)

/**
 * Formulário do motor, no celular (gaveta) e no desktop (janela). Serve ao cadastro (1.2 a 1.8) e
 * à edição (3.8). Na edição o rastreio é fixo, e no celular as abas "Dados gerais" e "Bobinagem"
 * trocam de seção; no cadastro o celular tem dois passos com Continuar e Voltar.
 */
export function MotorForm(props: Props) {
  const editar = props.modo === "editar"
  const router = useRouter()
  const celular = useIsMobile()
  const form = useForm<MotorFormValues>({
    resolver: zodResolver(motorFormSchema),
    defaultValues: props.modo === "editar" ? props.valores : valoresIniciais(),
    mode: "onTouched",
  })
  const { control, register, formState, setError, clearErrors, getValues } = form
  const modo = useWatch({ control, name: "rastreioModo" })
  const tipo = useWatch({ control, name: "tipoMotor" })
  const rastreioDigitado = useWatch({ control, name: "rastreio" })

  const [passo, setPasso] = useState<1 | 2>(1)
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

  async function continuar() {
    const ok = await form.trigger([...CAMPOS_PASSO_1])
    if (!ok) return
    if (getValues("rastreioModo") === "MANUAL" && !(await conferirRastreio())) return
    setPasso(2)
  }

  const salvar = form.handleSubmit(
    async (valores) => {
      if (props.modo === "novo" && valores.rastreioModo === "MANUAL" && !(await conferirRastreio())) {
        setPasso(1)
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
            const a = await enviarVariasFotos(fotosEquipamento, { rastreio: r.rastreio, tipo: "EQUIPAMENTO" })
            const b = await enviarVariasFotos(fotosEsquema, { rastreio: r.rastreio, tipo: "ESQUEMA" })
            setEnviandoFotos(false)
            const falhas = [...a.falhas, ...b.falhas]
            if (falhas.length > 0) {
              toast.warning(`O motor foi salvo, mas ${falhas.length} foto(s) não foram enviadas. Adicione pela ficha.`)
            }
          }
          // O Next preserva o estado da rota interceptada ao fechar: limpa para o próximo cadastro.
          setFotosEquipamento([])
          setFotosEsquema([])
          form.reset(valoresIniciais())
          setBase(null)
          setPasso(1)
          setEmUso(null)
          // Conclui o cadastro abrindo a etiqueta (1.9). `replace`: fechar a etiqueta volta para onde o cadastro começou.
          router.replace(`/motores/${encodeURIComponent(r.rastreio)}/etiqueta?novo=1`)
          router.refresh()
        } else if (r.campo === "rastreio") {
          setError("rastreio", { type: "server", message: r.erro })
          setEmUso(normalizarRastreio(valores.rastreio))
          setPasso(1)
        } else {
          toast.error(r.erro, tentarDeNovo)
        }
      } catch {
        toast.error("Sem conexão. Verifique a internet e tente de novo.", tentarDeNovo)
      } finally {
        setSalvando(false)
      }
    },
    (erros) => {
      if (CAMPOS_PASSO_1.some((c) => erros[c])) setPasso(1)
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

  const rodape =
    !celular || editar ? (
      botaoSalvar
    ) : passo === 1 ? (
      <Button type="button" onClick={continuar} disabled={ocupado || bloqueado} className="flex-1">
        {verificando && <SpinnerIcon className="animate-spin" aria-hidden="true" />}
        Continuar
      </Button>
    ) : (
      <>
        <Button type="button" variant="secondary" onClick={() => setPasso(1)} disabled={salvando} className="flex-1">
          Voltar
        </Button>
        {botaoSalvar}
      </>
    )

  const erroRastreio = formState.errors.rastreio?.message
  const titulo = editar ? "Editar dados" : celular && passo === 2 ? "Bobinagem" : "Novo motor"

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
        {/* Edição no celular: abas Dados gerais / Bobinagem */}
        {editar && (
          <div className="mb-4 md:hidden">
            <Segmentado
              rotulo="Seção"
              value={String(passo) as "1" | "2"}
              onValueChange={(v) => setPasso(v === "2" ? 2 : 1)}
              opcoes={[
                { valor: "1", rotulo: "Dados gerais" },
                { valor: "2", rotulo: "Bobinagem" },
              ]}
            />
          </div>
        )}

        <form
          id={ID_FORM}
          noValidate
          onSubmit={(e) => {
            if (!editar && celular && passo === 1) {
              e.preventDefault()
              void continuar()
              return
            }
            void salvar(e)
          }}
          className="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-8"
        >
          {/* Coluna da esquerda (passo 1 / aba Dados gerais) */}
          <div className={`${passo === 2 ? "hidden md:flex" : "flex"} flex-col gap-5`}>
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
                <section className="flex flex-col gap-3" aria-label="Rastreio">
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
                    <div className="rounded-[16px] bg-bg p-4">
                      <p className="text-xs font-semibold text-text-tertiary">Número previsto</p>
                      <p className="mt-1 text-xl font-bold tabular-nums" aria-live="polite">
                        {props.modo === "novo" && (
                          <Suspense fallback={<span className="text-text-tertiary">Calculando...</span>}>
                            <NumeroPrevisto previsto={props.previsto} />
                          </Suspense>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
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

            <section className="flex flex-col gap-3" aria-label="Dados gerais">
              <TituloSecao>Dados gerais</TituloSecao>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <CampoTexto name="clienteNome" label="Cliente" obrigatorio className="col-span-full" />
                <CampoTexto name="marca" label="Marca" placeholder="WEG" />
                <CampoTexto name="modelo" label="Modelo" placeholder="W22" />
                <CampoTexto name="tipoEquipamento" label="Tipo de equipamento" className="col-span-full md:col-span-1" />
                <CampoPotencia />
                <CampoLista name="tensao" label="Tensão" opcoes={config.listas.tensoes} sufixo="V" />
                <CampoTexto name="corrente" label="Corrente (A)" inputMode="decimal" placeholder="13,8" />
                <CampoLista name="rpm" label="RPM" opcoes={config.listas.rpms} sufixo="RPM" />
                <CampoTexto name="fatorServico" label="F.S." placeholder="1,15" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <CampoTexto name="item" label="Item" />
                <CampoTexto name="pacote" label="Pacote" />
                <CampoTexto name="diametro" label="Diâmetro" />
              </div>
            </section>
          </div>

          {/* Coluna da direita (passo 2 / aba Bobinagem) */}
          <div className={`${passo === 1 ? "hidden md:flex" : "flex"} flex-col gap-5`}>
            <section className="flex flex-col gap-3" aria-label="Bobinagem">
              <div className="hidden md:block">
                <TituloSecao>Bobinagem</TituloSecao>
              </div>
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
            </section>

            {!editar && (
              <section className="flex flex-col gap-3" aria-label="Fotos">
                <TituloSecao>Fotos (opcional)</TituloSecao>
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
              </section>
            )}
          </div>
        </form>
      </FormProvider>
    </GavetaOuJanela>
  )
}
