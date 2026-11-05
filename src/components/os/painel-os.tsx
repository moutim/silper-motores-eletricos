import { ClipboardTextIcon } from "@phosphor-icons/react/ssr"
import { Vazio } from "@/components/motores/ficha/paineis"
import type { Bobinagem, Motor, OrdemServico } from "@/lib/types"
import { DetalheOS } from "./detalhe-os"
import { HistoricoOS } from "./historico-os"

/** Aba "Ordens de serviço" da ficha (3.3): lista no celular; detalhe e histórico lado a lado no desktop. */
export function PainelOS({
  motor,
  bobinagens,
  ordens,
  selecionadaId,
}: {
  motor: Motor
  bobinagens: Bobinagem[]
  ordens: OrdemServico[]
  selecionadaId?: string
}) {
  if (ordens.length === 0) {
    return (
      <Vazio
        icone={<ClipboardTextIcon size={20} />}
        titulo="Nenhuma O.S. ainda"
        apoio="Cada visita do motor à oficina vira uma O.S. separada."
        acao="Nova O.S."
        href={motor.ativo ? `/motores/${encodeURIComponent(motor.rastreio)}/os/nova` : undefined}
      />
    )
  }
  const selecionada = ordens.find((o) => o.id === selecionadaId) ?? ordens[0]

  return (
    <>
      <div className="md:hidden">
        <HistoricoOS ordens={ordens} rastreio={motor.rastreio} selecionadaId={selecionada.id} modo="celular" />
      </div>
      <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_340px] md:items-start md:gap-5">
        <DetalheOS os={selecionada} motor={motor} bobinagensAtuais={bobinagens} />
        <HistoricoOS ordens={ordens} rastreio={motor.rastreio} selecionadaId={selecionada.id} modo="desktop" />
      </div>
    </>
  )
}
