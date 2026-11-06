import { ClipboardTextIcon, ClockCounterClockwiseIcon } from "@phosphor-icons/react/ssr"
import type { Motor, OrdemServico } from "@/lib/types"
import { CartaoSecao } from "@/components/layout/cartao-secao"
import { LinhaMotor } from "@/components/motores/linha-motor"
import { LinhaOSMotor } from "@/components/os/linha-os-motor"

function Vazio({ children }: { children: string }) {
  return <p className="px-4 pb-3 pt-1 text-sm text-text-tertiary">{children}</p>
}

function ListaMotores({ motores }: { motores: Motor[] }) {
  return (
    <ul>
      {motores.map((m, i) => (
        <LinhaMotor key={m.id} motor={m} ultima={i === motores.length - 1} />
      ))}
    </ul>
  )
}

/** "Acessados recentemente" (3 no celular) e "Motores recentes" (4 no desktop). */
export function MotoresRecentes({ motores, recentesCelular }: { motores: Motor[]; recentesCelular: number }) {
  return (
    <CartaoSecao
      icone={<ClockCounterClockwiseIcon size={18} />}
      titulo={
        <>
          <span className="md:hidden">Acessados recentemente</span>
          <span className="max-md:hidden">Motores recentes</span>
        </>
      }
    >
      {motores.length === 0 ? (
        <Vazio>Nenhum motor aberto ainda. Abra uma ficha e ela aparece aqui.</Vazio>
      ) : (
        <>
          <div className="md:hidden">
            <ListaMotores motores={motores.slice(0, recentesCelular)} />
          </div>
          <div className="max-md:hidden">
            <ListaMotores motores={motores} />
          </div>
        </>
      )}
    </CartaoSecao>
  )
}

/** "Últimas O.S." (só desktop, 4 linhas). */
export function UltimasOS({ ordens }: { ordens: { os: OrdemServico; motor: Motor }[] }) {
  return (
    <div className="max-md:hidden">
      <CartaoSecao titulo="Últimas O.S." icone={<ClipboardTextIcon size={18} />}>
        {ordens.length === 0 ? (
          <Vazio>Nenhuma O.S. ainda.</Vazio>
        ) : (
          <ul>
            {ordens.map(({ os, motor }, i) => (
              <LinhaOSMotor key={os.id} os={os} motor={motor} ultima={i === ordens.length - 1} direita="data" />
            ))}
          </ul>
        )}
      </CartaoSecao>
    </div>
  )
}
