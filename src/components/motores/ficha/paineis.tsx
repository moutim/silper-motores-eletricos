import { ClipboardTextIcon, ImageIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@/components/ui/button"
import { linhasBobinagem, linhasDadosGerais, ordenarBobinagens, tituloBobinagem } from "@/lib/ficha"
import type { Bobinagem, Motor } from "@/lib/types"
import { CartaoLinhas, TituloBloco } from "./info"

function Vazio({ icone, titulo, apoio, acao }: { icone: React.ReactNode; titulo: string; apoio: string; acao: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card bg-surface px-6 py-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-[8px] bg-fill text-text-tertiary" aria-hidden="true">
        {icone}
      </span>
      <div>
        <p className="text-sm font-bold">{titulo}</p>
        <p className="mt-1 text-xs text-text-tertiary">{apoio}</p>
      </div>
      <Button disabled variant="secondary" className="h-[42px] text-[13px]">
        {acao} <span className="text-xs font-normal">· Em breve</span>
      </Button>
    </div>
  )
}

/** Aba "Dados técnicos" (3.1 e 3.2): todos os dados gerais e a bobinagem; no desktop, 3 colunas. */
export function PainelDados({ motor, bobinagens }: { motor: Motor; bobinagens: Bobinagem[] }) {
  return (
    <div className="md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_340px] md:items-start md:gap-5">
      <div>
        <TituloBloco>Dados gerais</TituloBloco>
        <CartaoLinhas linhas={linhasDadosGerais(motor)} />
      </div>

      <div>
        {ordenarBobinagens(bobinagens).map((b) => (
          <div key={b.id} className="md:mt-5 md:first:mt-0">
            <TituloBloco>{tituloBobinagem(b)}</TituloBloco>
            <CartaoLinhas linhas={linhasBobinagem(b)} />
          </div>
        ))}
        {bobinagens.length === 0 && (
          <>
            <TituloBloco>Bobinagem</TituloBloco>
            <p className="px-4 text-sm text-text-tertiary md:px-1">Sem dados de bobinagem.</p>
          </>
        )}
      </div>

      <div className="hidden md:block">
        <TituloBloco>Últimas O.S.</TituloBloco>
        <div className="rounded-card bg-surface px-4 py-6 text-center text-sm text-text-tertiary">Nenhuma O.S. ainda</div>
      </div>
    </div>
  )
}

export function PainelOS() {
  return (
    <Vazio
      icone={<ClipboardTextIcon size={20} />}
      titulo="Nenhuma O.S. ainda"
      apoio="Cada visita do motor à oficina vira uma O.S. separada."
      acao="Nova O.S."
    />
  )
}

export function PainelFotos() {
  return (
    <Vazio
      icone={<ImageIcon size={20} />}
      titulo="Nenhuma foto ainda"
      apoio="Fotos do equipamento, esquemas de ligação e fotos de serviço."
      acao="Adicionar foto"
    />
  )
}
