"use client"

import { type FieldValues, type Path, Controller, get, useFormContext } from "react-hook-form"
import { CaretUpDownIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MotorFormValues } from "@/lib/motor-schema"

/** Gatilho dos seletores do formulário: mesma altura, borda e fonte dos campos de texto (o padrão do shadcn é h-8). */
const classeSelect =
  "rounded-field border-border bg-surface text-[13px] data-[size=default]:h-11 md:data-[size=default]:h-10"
const classeRotulo = "text-xs font-semibold text-text-tertiary"

export function CampoTexto<T extends FieldValues = MotorFormValues>({
  name,
  label,
  obrigatorio,
  placeholder,
  inputMode,
  dica,
  maxLength,
  className,
}: {
  name: Path<T>
  label: string
  obrigatorio?: boolean
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  /** Texto de apoio abaixo do campo (some quando há erro). */
  dica?: string
  maxLength?: number
  className?: string
}) {
  const { register, formState } = useFormContext<T>()
  const erro = get(formState.errors, name) as { message?: string } | undefined
  const id = `campo-${name.replace(".", "-")}`
  return (
    <Field data-invalid={!!erro} className={className}>
      <FieldLabel htmlFor={id} className={classeRotulo}>
        {label}
        {obrigatorio && <span aria-hidden="true"> *</span>}
      </FieldLabel>
      <Input
        id={id}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-required={obrigatorio}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${id}-erro` : dica ? `${id}-dica` : undefined}
        maxLength={maxLength}
        {...register(name)}
      />
      {erro?.message ? (
        <FieldError id={`${id}-erro`}>{erro.message}</FieldError>
      ) : (
        dica && (
          <p id={`${id}-dica`} className="text-xs text-text-tertiary">
            {dica}
          </p>
        )
      )}
    </Field>
  )
}

const VAZIO = "__vazio"
const OUTRO = "__outro"

/** Campo de lista (tensão, RPM) com a opção "Outro valor…", que abre um campo livre (D-38). */
export function CampoLista({
  name,
  label,
  opcoes,
  sufixo,
}: {
  name: "tensao" | "rpm"
  label: string
  opcoes: readonly string[]
  sufixo: string
}) {
  const { control, formState } = useFormContext<MotorFormValues>()
  const erro = get(formState.errors, name) as { message?: string } | undefined
  const id = `campo-${name}`
  const [outro, setOutro] = useState(false)

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const valor = field.value
        const foraDaLista = valor !== "" && !opcoes.includes(valor)
        const mostrarLivre = outro || foraDaLista
        const selecionado = mostrarLivre ? OUTRO : valor === "" ? VAZIO : valor
        return (
          <Field data-invalid={!!erro}>
            <FieldLabel htmlFor={id} className={classeRotulo}>
              {label}
            </FieldLabel>
            <Select
              value={selecionado}
              onValueChange={(v) => {
                if (v === OUTRO) {
                  setOutro(true)
                  field.onChange("")
                  return
                }
                setOutro(false)
                field.onChange(v === VAZIO ? "" : v)
              }}
            >
              <SelectTrigger id={id} className={`w-full ${classeSelect}`}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={VAZIO}>Não informar</SelectItem>
                {opcoes.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o} {sufixo}
                  </SelectItem>
                ))}
                <SelectItem value={OUTRO}>Outro valor…</SelectItem>
              </SelectContent>
            </Select>
            {mostrarLivre && (
              <Input
                aria-label={`${label}, outro valor`}
                placeholder={`Digite o valor em ${sufixo}`}
                value={valor}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
            )}
            {erro?.message && <FieldError>{erro.message}</FieldError>}
          </Field>
        )
      }}
    />
  )
}

export function CampoPotencia() {
  const { register, control, formState } = useFormContext<MotorFormValues>()
  const erro = formState.errors.potenciaValor
  return (
    <Field data-invalid={!!erro}>
      <FieldLabel htmlFor="campo-potenciaValor" className={classeRotulo}>
        Potência
      </FieldLabel>
      <div className="flex gap-2">
        <Input
          id="campo-potenciaValor"
          inputMode="decimal"
          placeholder="5"
          aria-invalid={!!erro}
          aria-describedby={erro ? "campo-potenciaValor-erro" : undefined}
          className="min-w-0 flex-1"
          {...register("potenciaValor")}
        />
        <Controller
          control={control}
          name="potenciaUnidade"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-label="Unidade da potência" className={`w-[84px] shrink-0 ${classeSelect}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CV">CV</SelectItem>
                <SelectItem value="HP">HP</SelectItem>
                <SelectItem value="KW">kW</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      {erro?.message && <FieldError id="campo-potenciaValor-erro">{erro.message}</FieldError>}
    </Field>
  )
}

export function TituloSecao({ children, dica }: { children: React.ReactNode; dica?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="text-xs font-medium uppercase tracking-[0.02em] text-text-tertiary">{children}</h3>
      {dica && <span className="text-xs text-text-tertiary">{dica}</span>}
    </div>
  )
}

const NOVO_CLIENTE = "__novo_cliente"

/**
 * Cliente do motor: um só campo. Fechado, é uma lista dos clientes já cadastrados com
 * "Adicionar novo cliente" na primeira posição; ao escolher essa opção o próprio campo vira
 * texto livre. O botão à direita do campo volta para a lista.
 */
export function CampoCliente({ clientes }: { clientes: string[] }) {
  const { control, formState } = useFormContext<MotorFormValues>()
  const erro = get(formState.errors, "clienteNome") as { message?: string } | undefined
  const [digitando, setDigitando] = useState(false)
  const id = "campo-clienteNome"

  return (
    <Controller
      control={control}
      name="clienteNome"
      render={({ field }) => {
        const valor = field.value
        // Valor que não está na lista (ex.: copiado de um motor-base) também é mostrado como texto.
        const modoTexto = digitando || (valor !== "" && !clientes.includes(valor))
        return (
          <Field data-invalid={!!erro} className="col-span-full md:col-span-6">
            <FieldLabel htmlFor={id} className={classeRotulo}>
              Cliente<span aria-hidden="true"> *</span>
            </FieldLabel>
            {modoTexto ? (
              <div className="relative">
                <Input
                  id={id}
                  autoFocus={digitando}
                  placeholder="Nome do novo cliente"
                  aria-required
                  aria-invalid={!!erro}
                  className="pr-11"
                  value={valor}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                />
                <button
                  type="button"
                  aria-label="Escolher cliente da lista"
                  onClick={() => {
                    setDigitando(false)
                    field.onChange("")
                  }}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-field text-text-tertiary outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <CaretUpDownIcon size={16} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <Select
                value={valor}
                onValueChange={(v) => {
                  if (v === NOVO_CLIENTE) {
                    setDigitando(true)
                    field.onChange("")
                    return
                  }
                  field.onChange(v)
                }}
              >
                <SelectTrigger id={id} aria-invalid={!!erro} className={`w-full ${classeSelect}`}>
                  <SelectValue placeholder="Selecione ou adicione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NOVO_CLIENTE}>Adicionar novo cliente</SelectItem>
                  {clientes.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {erro?.message && <FieldError>{erro.message}</FieldError>}
          </Field>
        )
      }}
    />
  )
}
