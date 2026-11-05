import { ROTULO_TIPO_FOTO, agruparFotos } from "@/lib/foto"
import type { Foto, Motor, OrdemServico } from "@/lib/types"
import { TituloBloco } from "@/components/motores/ficha/info"
import { AdicionarFotos } from "./adicionar-fotos"
import { type FotoView, GradeFotos } from "./grade-fotos"

export const paraVisao = (fotos: Foto[], alt: (f: Foto) => string): FotoView[] =>
  fotos.map((f) => ({ id: f.id, alt: alt(f) }))

function Grupo({
  titulo,
  fotos,
  adicionar,
  podeEditar,
}: {
  titulo: string
  fotos: FotoView[]
  adicionar: React.ReactNode
  podeEditar: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-text-tertiary">{titulo}</p>
      <GradeFotos fotos={fotos} podeExcluir={podeEditar}>
        {podeEditar && adicionar}
      </GradeFotos>
      {fotos.length === 0 && !podeEditar && <p className="text-sm text-text-tertiary">Nenhuma foto.</p>}
    </div>
  )
}

/**
 * Aba "Fotos e esquemas" da ficha (3.7): seção "Motor" (equipamento e esquema de ligação) e uma seção por
 * O.S. que tem foto. Foto de O.S. nunca aparece como foto do motor (RN-11). Motor desativado só mostra.
 */
export function PainelFotos({ motor, fotos, ordens }: { motor: Motor; fotos: Foto[]; ordens: OrdemServico[] }) {
  const g = agruparFotos(fotos, ordens)
  const podeEditar = motor.ativo
  const altMotor = (f: Foto) => `${ROTULO_TIPO_FOTO[f.tipo]} do motor ${motor.rastreio}`

  return (
    <div>
      <TituloBloco>Motor</TituloBloco>
      <div className="flex flex-col gap-4 rounded-card bg-surface p-3.5">
        <Grupo
          titulo={ROTULO_TIPO_FOTO.EQUIPAMENTO}
          fotos={paraVisao(g.motor.equipamento, altMotor)}
          podeEditar={podeEditar}
          adicionar={<AdicionarFotos ladrilho destino={{ rastreio: motor.rastreio, tipo: "EQUIPAMENTO" }} />}
        />
        <Grupo
          titulo={ROTULO_TIPO_FOTO.ESQUEMA}
          fotos={paraVisao(g.motor.esquema, altMotor)}
          podeEditar={podeEditar}
          adicionar={<AdicionarFotos ladrilho destino={{ rastreio: motor.rastreio, tipo: "ESQUEMA" }} />}
        />
      </div>

      {g.porOS.map(({ os, fotos: doOS }) => (
        <div key={os.id}>
          <TituloBloco>Da O.S. {os.numero}</TituloBloco>
          <div className="rounded-card bg-surface p-3.5">
            <GradeFotos
              fotos={paraVisao(doOS, () => `Foto de serviço da O.S. ${os.numero}, motor ${motor.rastreio}`)}
              podeExcluir={podeEditar}
            >
              {podeEditar && <AdicionarFotos ladrilho destino={{ rastreio: motor.rastreio, tipo: "SERVICO", osId: os.id }} />}
            </GradeFotos>
          </div>
        </div>
      ))}
    </div>
  )
}
