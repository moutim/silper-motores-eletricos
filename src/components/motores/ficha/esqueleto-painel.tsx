import { EsqueletoAbaFicha } from "@/components/layout/esqueletos"
import type { Aba } from "@/lib/ficha"

/**
 * Painel de carregamento ao trocar de aba na ficha: o esqueleto tem a forma da aba de destino
 * (dados: 3 colunas de cartões; O.S.: lista no celular e detalhe no desktop; fotos: grades de fotos).
 */
export function EsqueletoPainel({ aba }: { aba: Aba }) {
  return (
    <div role="status" aria-live="polite" aria-label="Carregando">
      <span className="sr-only">Carregando...</span>
      <EsqueletoAbaFicha aba={aba} />
    </div>
  )
}
