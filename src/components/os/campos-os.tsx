"use client"

import { Controller, get, useFormContext } from "react-hook-form"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { moedaParaCampo, parseMoeda } from "@/lib/moeda"
import type { OSFormValues } from "@/lib/os-schema"

const classeRotulo = "text-xs font-semibold text-text-tertiary"

export function CampoData({ name, label, className }: { name: "dataEntrada"; label: string; className?: string }) {
  const { register, formState } = useFormContext<OSFormValues>()
  const erro = get(formState.errors, name) as { message?: string } | undefined
  return (
    <Field data-invalid={!!erro} className={className}>
      <FieldLabel htmlFor={`campo-${name}`} className={classeRotulo}>
        {label}
        <span aria-hidden="true"> *</span>
      </FieldLabel>
      <Input
        id={`campo-${name}`}
        type="date"
        aria-required
        aria-invalid={!!erro}
        aria-describedby={erro ? `campo-${name}-erro` : undefined}
        {...register(name)}
      />
      {erro?.message && <FieldError id={`campo-${name}-erro`}>{erro.message}</FieldError>}
    </Field>
  )
}

export function CampoTextoLongo({
  name,
  label,
  placeholder,
  rows = 3,
  className,
}: {
  name: "defeito" | "servicoExecutado" | "observacoes"
  label: string
  placeholder?: string
  rows?: number
  className?: string
}) {
  const { register, formState } = useFormContext<OSFormValues>()
  const erro = get(formState.errors, name) as { message?: string } | undefined
  return (
    <Field data-invalid={!!erro} className={className}>
      <FieldLabel htmlFor={`campo-${name}`} className={classeRotulo}>
        {label}
      </FieldLabel>
      <Textarea
        id={`campo-${name}`}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={!!erro}
        aria-describedby={erro ? `campo-${name}-erro` : undefined}
        className="min-h-[88px] resize-y rounded-field border-border bg-surface px-3 py-2.5 text-[13.5px] md:text-[13px]"
        {...register(name)}
      />
      {erro?.message && <FieldError id={`campo-${name}-erro`}>{erro.message}</FieldError>}
    </Field>
  )
}

/** Valor em reais com "R$" como prefixo dentro do campo; formata ao sair (1234 -> 1.234,00). */
export function CampoMoeda({ label, className }: { label: string; className?: string }) {
  const { control, formState } = useFormContext<OSFormValues>()
  const erro = formState.errors.valorNota
  return (
    <Field data-invalid={!!erro} className={className}>
      <FieldLabel htmlFor="campo-valorNota" className={classeRotulo}>
        {label}
      </FieldLabel>
      <Controller
        control={control}
        name="valorNota"
        render={({ field }) => (
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13.5px] text-text-tertiary md:text-[13px]"
            >
              R$
            </span>
            <Input
              id="campo-valorNota"
              inputMode="decimal"
              placeholder="0,00"
              autoComplete="off"
              aria-invalid={!!erro}
              aria-describedby={erro ? "campo-valorNota-erro" : undefined}
              className="pl-9 tabular-nums"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value.replace(/[^\d.,]/g, ""))}
              onBlur={() => {
                const n = parseMoeda(field.value)
                if (n !== null && Number.isFinite(n)) field.onChange(moedaParaCampo(n))
                field.onBlur()
              }}
            />
          </div>
        )}
      />
      {erro?.message ? (
        <FieldError id="campo-valorNota-erro">{erro.message}</FieldError>
      ) : (
        <p className="text-xs text-text-tertiary">Opcional.</p>
      )}
    </Field>
  )
}
