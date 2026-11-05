import Link from "next/link"
import { buscar, montarQuery, type ParametrosBusca, POR_GRUPO, temFiltros, opcoesDosFiltros } from "@/lib/busca"
import { CartaoCadastrar } from "@/components/motores/cartao-cadastrar"
import { LinhaMotor } from "@/components/motores/linha-motor"
import { LinhaOSMotor } from "@/components/os/linha-os-motor"
import { Button } from "@/components/ui/button"
import { carregarBase } from "@/server/busca"
import { BarraBusca } from "./barra-busca"

function Titulo({ children, total }: { children: string; total: number }) {
  return (
    <div className="flex items-baseline justify-between px-4 md:px-1">
      <h2 className="text-xs font-medium uppercase tracking-[0.02em] text-text-tertiary">
        {children} ({total})
      </h2>
      <span className="text-xs text-text-tertiary">
        <span className="md:hidden">Toque para abrir</span>
        <span className="max-md:hidden">Clique para abrir</span>
      </span>
    </div>
  )
}

function VerMais({ href, restantes }: { href: string; restantes: number }) {
  return (
    <Button asChild variant="secondary" className="self-center">
      <Link href={href} scroll={false}>
        Ver mais ({restantes})
      </Link>
    </Button>
  )
}

/**
 * Tela de busca (2.1): barra, filtros e os dois grupos, Motores e Ordens de serviço, com até 20 por
 * grupo e "Ver mais". Sem termo, lista os motores mais recentes. Busca em memória (D-09).
 */
export async function ResultadosBusca({ parametros }: { parametros: ParametrosBusca }) {
  const { q, filtros, paginasMotores, paginasOS } = parametros
  const { motores, ordens } = await carregarBase()
  const r = buscar(motores, ordens, q, filtros)
  const opcoes = opcoesDosFiltros(motores)

  const limiteM = paginasMotores * POR_GRUPO
  const limiteO = paginasOS * POR_GRUPO
  const listaM = r.motores.slice(0, limiteM)
  const listaO = r.ordens.slice(0, limiteO)
  const buscando = q.trim() !== "" || temFiltros(filtros)

  return (
    <>
      <BarraBusca key="busca" q={q} filtros={filtros} opcoes={opcoes} modo="digitando" />
      <CartaoCadastrar />

      <p className="sr-only" role="status">
        {r.motores.length} motores{buscando ? `, ${r.ordens.length} ordens de serviço` : ""}
      </p>

      {!buscando && motores.length === 0 && (
        <p className="px-1 text-sm text-text-tertiary">Nenhum motor ainda. Cadastre o primeiro.</p>
      )}

      {buscando && r.motores.length === 0 && r.ordens.length === 0 && (
        <div className="flex flex-col items-start gap-3 px-1" role="status">
          <p className="text-sm text-text-tertiary">
            {q.trim() !== "" ? `Nenhum resultado para “${q.trim()}”` : "Nenhum motor com esses filtros"}
          </p>
          <Button asChild variant="secondary">
            <Link href="/motores">Limpar busca</Link>
          </Button>
        </div>
      )}

      {r.motores.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Motores">
          <Titulo total={r.motores.length}>{buscando ? "Motores" : "Motores recentes"}</Titulo>
          <ul className="overflow-hidden rounded-card bg-surface">
            {listaM.map((m, i) => (
              <LinhaMotor key={m.id} motor={m} ultima={i === listaM.length - 1} />
            ))}
          </ul>
          {r.motores.length > limiteM && (
            <VerMais
              href={`/motores${montarQuery({ ...parametros, paginasMotores: paginasMotores + 1 })}`}
              restantes={r.motores.length - limiteM}
            />
          )}
        </section>
      )}

      {r.ordens.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Ordens de serviço">
          <Titulo total={r.ordens.length}>Ordens de serviço</Titulo>
          <ul className="overflow-hidden rounded-card bg-surface">
            {listaO.map(({ os, motor }, i) => (
              <LinhaOSMotor key={os.id} os={os} motor={motor} ultima={i === listaO.length - 1} />
            ))}
          </ul>
          {r.ordens.length > limiteO && (
            <VerMais
              href={`/motores${montarQuery({ ...parametros, paginasOS: paginasOS + 1 })}`}
              restantes={r.ordens.length - limiteO}
            />
          )}
        </section>
      )}
    </>
  )
}
