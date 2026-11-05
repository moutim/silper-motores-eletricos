import type { Motor, OrdemServico } from "@/lib/types"
import { LinhaMotor } from "@/components/motores/linha-motor"
import { LinhaOSMotor } from "@/components/os/linha-os-motor"

function Secao({ titulo, children }: { titulo: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between px-4 md:px-1">
        <h2 className="text-xs font-medium uppercase tracking-[0.02em] text-text-tertiary">{titulo}</h2>
        <span className="text-xs text-text-tertiary">
          <span className="md:hidden">Toque para abrir</span>
          <span className="max-md:hidden">Clique para abrir</span>
        </span>
      </div>
      {children}
    </section>
  )
}

function Vazio({ children }: { children: string }) {
  return <p className="rounded-card bg-surface px-4 py-3 text-sm text-text-tertiary">{children}</p>
}

function ListaMotores({ motores }: { motores: Motor[] }) {
  return (
    <ul className="overflow-hidden rounded-card bg-surface">
      {motores.map((m, i) => (
        <LinhaMotor key={m.id} motor={m} ultima={i === motores.length - 1} />
      ))}
    </ul>
  )
}

/** "Acessados recentemente" (3 no celular) e "Motores recentes" (4 no desktop). */
export function MotoresRecentes({ motores, recentesCelular }: { motores: Motor[]; recentesCelular: number }) {
  return (
    <Secao
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
    </Secao>
  )
}

/** "Últimas O.S." (só desktop, 4 linhas). */
export function UltimasOS({ ordens }: { ordens: { os: OrdemServico; motor: Motor }[] }) {
  return (
    <div className="max-md:hidden">
      <Secao titulo="Últimas O.S.">
        {ordens.length === 0 ? (
          <Vazio>Nenhuma O.S. ainda.</Vazio>
        ) : (
          <ul className="overflow-hidden rounded-card bg-surface">
            {ordens.map(({ os, motor }, i) => (
              <LinhaOSMotor key={os.id} os={os} motor={motor} ultima={i === ordens.length - 1} direita="data" />
            ))}
          </ul>
        )}
      </Secao>
    </div>
  )
}
