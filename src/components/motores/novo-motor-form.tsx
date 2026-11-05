"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { SpinnerIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { GavetaOuJanela } from "@/components/layout/gaveta-ou-janela"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import { config } from "@/lib/config"
import { type MotorFormValues, motorFormSchema, valoresIniciais } from "@/lib/motor-schema"
import { normalizarRastreio, validarRastreioDigitado } from "@/lib/rastreio"
import { cadastrarMotor, verificarRastreio } from "@/server/actions/motores"
import { CampoLista, CampoPotencia, CampoTexto, TituloSecao } from "./campos"
import { GrupoBobinagem } from "./grupo-bobinagem"
import { Segmentado } from "./segmentado"

const ID_FORM = "novo-motor"

/** Campos do passo 1 no celular (rastreio e dados gerais). */
const CAMPOS_PASSO_1 = [
  "rastreio", "clienteNome", "marca", "modelo", "tipoEquipamento", "potenciaValor",
  "tensao", "corrente", "rpm", "fatorServico", "item", "pacote", "diametro",
] as const

export function NovoMotorForm({ previsto, pagina }: { previsto: string; pagina?: boolean }) {
  const router = useRouter()
  const celular = useIsMobile()
  const form = useForm<MotorFormValues>({
    resolver: zodResolver(motorFormSchema),
    defaultValues: valoresIniciais(),
    mode: "onTouched",
  })
  const { control, register, formState, setError, clearErrors, getValues } = form
  const modo = useWatch({ control, name: "rastreioModo" })
  const tipo = useWatch({ control, name: "tipoMotor" })
  const rastreioDigitado = useWatch({ control, name: "rastreio" })

  const [passo, setPasso] = useState<1 | 2>(1)
  const [salvando, setSalvando] = useState(false)
  const [verificando, setVerificando] = useState(false)
  /** Chave do último rastreio digitado que o servidor disse estar em uso. Bloqueia o Salvar. */
  const [emUso, setEmUso] = useState<string | null>(null)

  const bloqueado = modo === "MANUAL" && emUso !== null && normalizarRastreio(rastreioDigitado) === emUso
  const aoFechar = () => (pagina ? router.push("/motores") : router.back())

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

  async function continuar() {
    const ok = await form.trigger([...CAMPOS_PASSO_1])
    if (!ok) return
    if (getValues("rastreioModo") === "MANUAL" && !(await conferirRastreio())) return
    setPasso(2)
  }

  const salvar = form.handleSubmit(
    async (valores) => {
      if (valores.rastreioModo === "MANUAL" && !(await conferirRastreio())) {
        setPasso(1)
        return
      }
      setSalvando(true)
      try {
        const r = await cadastrarMotor(valores)
        if (r.ok) {
          toast.success(`Motor cadastrado: ${r.rastreio}`)
          // O Next preserva o estado da rota interceptada ao fechar: limpa para o próximo cadastro.
          form.reset(valoresIniciais())
          setPasso(1)
          setEmUso(null)
          aoFechar()
          router.refresh()
        } else if (r.campo === "rastreio") {
          setError("rastreio", { type: "server", message: r.erro })
          setEmUso(normalizarRastreio(valores.rastreio))
          setPasso(1)
        } else {
          toast.error(r.erro, { action: { label: "Tentar de novo", onClick: () => void salvar() } })
        }
      } catch {
        toast.error("Sem conexão. Verifique a internet e tente de novo.", {
          action: { label: "Tentar de novo", onClick: () => void salvar() },
        })
      } finally {
        setSalvando(false)
      }
    },
    (erros) => {
      if (CAMPOS_PASSO_1.some((c) => erros[c])) setPasso(1)
    },
  )

  const ocupado = salvando || verificando
  const rotuloSalvar = salvando ? "Salvando..." : "Salvar motor"
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

  const rodape = !celular ? (
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

  return (
    <GavetaOuJanela
      titulo={celular && passo === 2 ? "Bobinagem" : "Novo motor"}
      descricao="Cadastro de um motor novo: rastreio, dados gerais e bobinagem."
      aoFechar={aoFechar}
      rodape={rodape}
    >
      <FormProvider {...form}>
        <form
          id={ID_FORM}
          noValidate
          onSubmit={(e) => {
            if (celular && passo === 1) {
              e.preventDefault()
              void continuar()
              return
            }
            void salvar(e)
          }}
          className="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-8"
        >
          {/* Coluna da esquerda (passo 1 no celular): rastreio, motor-base e dados gerais */}
          <div className={`${passo === 2 ? "hidden md:flex" : "flex"} flex-col gap-5`}>
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
                    {previsto}
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

            <section className="flex flex-col gap-2" aria-label="Motor-base">
              <TituloSecao>Partir de um motor já cadastrado (opcional)</TituloSecao>
              <button
                type="button"
                disabled
                className="flex h-11 items-center justify-between rounded-field border border-border bg-surface px-3 text-[13.5px] text-text-tertiary opacity-70 md:h-10 md:text-[13px]"
              >
                Escolher motor-base
                <span className="text-xs">Em breve</span>
              </button>
            </section>

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

          {/* Coluna da direita (passo 2 no celular): bobinagem e fotos */}
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

            <section className="flex flex-col gap-2" aria-label="Fotos">
              <TituloSecao>Fotos (opcional)</TituloSecao>
              {["Foto do equipamento", "Foto do esquema de ligação"].map((nome) => (
                <div
                  key={nome}
                  aria-disabled="true"
                  className="flex h-16 items-center justify-between rounded-field border border-dashed border-separator-opaque px-3 text-[13px] text-text-tertiary opacity-70"
                >
                  {nome}
                  <span className="text-xs">Em breve</span>
                </div>
              ))}
            </section>
          </div>
        </form>
      </FormProvider>
    </GavetaOuJanela>
  )
}
