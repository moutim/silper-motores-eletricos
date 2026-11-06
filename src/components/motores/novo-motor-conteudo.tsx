"use client"

import { useSearchParams } from "next/navigation"
import { MotorForm } from "./motor-form"

/**
 * Abre o formulário na hora: não depende de nada do servidor, então a rota é estática e já vem
 * pré-carregada. A previsão do rastreio é buscada pelo próprio formulário depois de aberto.
 * `?base=1` abre já a lista de motor-base.
 */
export function NovoMotorConteudo({ pagina }: { pagina?: boolean }) {
  const abrirBase = useSearchParams().get("base") === "1"
  return <MotorForm modo="novo" pagina={pagina} abrirBase={abrirBase} />
}
