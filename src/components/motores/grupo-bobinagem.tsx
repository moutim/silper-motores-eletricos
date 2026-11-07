"use client"

import { Controller, useFormContext } from "react-hook-form"
import { Field, FieldLabel } from "@/components/ui/field"
import type { MotorFormValues } from "@/lib/motor-schema"
import { CampoTexto } from "./campos"
import { Segmentado } from "./segmentado"

/** Os cinco campos de uma bobina: passo, voltas, fio, ligação e camada (doc 01, 4.3). */
export function GrupoBobinagem({
  grupo,
  titulo,
}: {
  grupo: "trabalho" | "auxiliar"
  titulo?: string
}) {
  const { control } = useFormContext<MotorFormValues>()
  return (
    <fieldset className="flex flex-col gap-3 md:grid md:grid-cols-[1fr_1fr_1fr_1.5fr_1.5fr] md:items-start">
      {titulo && <legend className="mb-3 text-sm font-bold md:col-span-full">{titulo}</legend>}
      <div className="grid grid-cols-2 gap-3 md:contents">
        <CampoTexto name={`${grupo}.passo`} label="Passo" placeholder="1-9" />
        <CampoTexto name={`${grupo}.voltas`} label="Voltas" inputMode="numeric" placeholder="38" />
        <CampoTexto name={`${grupo}.fio`} label="Fio" placeholder="0,95 mm" className="col-span-2 md:col-span-1" />
      </div>
      <div className="flex flex-col gap-3 md:contents">
      <Controller
        control={control}
        name={`${grupo}.ligacao`}
        render={({ field }) => (
          <Field>
            <FieldLabel className="text-xs font-semibold text-text-tertiary">Ligação</FieldLabel>
            <Segmentado
              rotulo={`Ligação${titulo ? `, ${titulo.toLowerCase()}` : ""}`}
              value={field.value}
              onValueChange={field.onChange}
              permitirVazio
              opcoes={[
                { valor: "SERIE", rotulo: "Série" },
                { valor: "PARALELO", rotulo: "Paralelo" },
              ]}
            />
          </Field>
        )}
      />
      <Controller
        control={control}
        name={`${grupo}.camada`}
        render={({ field }) => (
          <Field>
            <FieldLabel className="text-xs font-semibold text-text-tertiary">Camada</FieldLabel>
            <Segmentado
              rotulo={`Camada${titulo ? `, ${titulo.toLowerCase()}` : ""}`}
              value={field.value}
              onValueChange={field.onChange}
              permitirVazio
              opcoes={[
                { valor: "UNICA", rotulo: "Única" },
                { valor: "DUPLA", rotulo: "Dupla" },
              ]}
            />
          </Field>
        )}
      />
      </div>
    </fieldset>
  )
}
