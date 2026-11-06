"use client"

import { useState } from "react"
import { EscolherMotorOS } from "./escolher-motor-os"

/**
 * Botão que abre o seletor de motor da Nova O.S. Quem usa define o visual (`className` e filhos);
 * o seletor abre por cima da tela atual, sem trocar de página.
 */
export function BotaoNovaOS({ className, children }: { className?: string; children: React.ReactNode }) {
  const [aberto, setAberto] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setAberto(true)} aria-haspopup="dialog" className={className}>
        {children}
      </button>
      {aberto && <EscolherMotorOS aoFechar={() => setAberto(false)} />}
    </>
  )
}
