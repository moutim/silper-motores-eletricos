import { ClipboardTextIcon } from "@phosphor-icons/react/ssr"
import { Vazio } from "@/components/motores/ficha/paineis"
import { paraVisao } from "@/components/fotos/painel-fotos"
import type { Bobinagem, Foto, Motor, OrdemServico } from "@/lib/types"
import { DetalheOS } from "./detalhe-os"
import { HistoricoOS } from "./historico-os"

/** Aba "Ordens de serviço" da ficha (3.3): lista no celular; no desktop, o detalhe da O.S. escolhida, que troca de O.S. pelo seletor no título. */
export function PainelOS({
  motor,
  bobinagens,
  ordens,
  fotos,
  selecionadaId,
}: {
  motor: Motor
  bobinagens: Bobinagem[]
  ordens: OrdemServico[]
  fotos: Foto[]
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
      <div className="hidden md:block">
        <DetalheOS
          ordens={ordens}
          os={selecionada}
          motor={motor}
          bobinagensAtuais={bobinagens}
          fotos={paraVisao(
            fotos.filter((f) => f.osId === selecionada.id),
            () => `Foto de serviço da O.S. ${selecionada.numero}, motor ${motor.rastreio}`,
          )}
        />
      </div>
    </>
  )
}
