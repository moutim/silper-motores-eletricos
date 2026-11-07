"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface Props<T extends string> {
  value: T | ""
  onValueChange: (valor: T | "") => void
  opcoes: readonly { valor: T; rotulo: string }[]
  rotulo: string
  /** Permite desmarcar tocando de novo no item ativo (campos opcionais). */
  permitirVazio?: boolean
}

/** Controle segmentado (doc 02, seção 3): contêiner --bg-2, raio 10, padding 2; ativo em --primary. */
export function Segmentado<T extends string>({ value, onValueChange, opcoes, rotulo, permitirVazio }: Props<T>) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v === "" && !permitirVazio) return
        onValueChange(v as T | "")
      }}
      spacing={0}
      aria-label={rotulo}
      className="w-full rounded-[10px] bg-bg-2 p-0.5"
    >
      {opcoes.map((o) => (
        <ToggleGroupItem
          key={o.valor}
          value={o.valor}
          className="h-10 flex-1 rounded-[8px] text-xs font-semibold text-text-secondary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground md:h-9"
        >
          {o.rotulo}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
