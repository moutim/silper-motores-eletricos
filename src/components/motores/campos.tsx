"use client"

import { type FieldValues, type Path, Controller, get, useFormContext } from "react-hook-form"
import { useState } from "react"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MotorFormValues } from "@/lib/motor-schema"

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
              <SelectTrigger id={id} className="h-11 w-full rounded-field bg-surface md:h-10">
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
              <SelectTrigger aria-label="Unidade da potência" className="h-11 w-[84px] shrink-0 rounded-field bg-surface md:h-10">
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
