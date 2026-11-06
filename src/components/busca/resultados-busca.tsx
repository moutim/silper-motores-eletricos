import { ClipboardTextIcon, EngineIcon } from "@phosphor-icons/react/ssr"
import Link from "next/link"
import { buscar, montarQuery, type ParametrosBusca, POR_GRUPO, temFiltros, opcoesDosFiltros } from "@/lib/busca"
import { BotaoAcaoCartao } from "@/components/layout/botao-acao-cartao"
import { CartaoSecao } from "@/components/layout/cartao-secao"
import { LinhaMotor } from "@/components/motores/linha-motor"
import { LinhaOSMotor } from "@/components/os/linha-os-motor"
import { Button } from "@/components/ui/button"
import { carregarBase } from "@/server/busca"
import { BarraBusca } from "./barra-busca"

function Cadastrar() {
  return <BotaoAcaoCartao href="/motores/novo">Cadastrar</BotaoAcaoCartao>
}

function VerMais({ href, restantes }: { href: string; restantes: number }) {
  return (
    <Button asChild variant="secondary" className="mx-auto my-3 flex w-fit">
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

      <p className="sr-only" role="status">
        {r.motores.length} motores{buscando ? `, ${r.ordens.length} ordens de serviço` : ""}
      </p>

      {!buscando && motores.length === 0 && (
        <CartaoSecao rotulo="Motores" icone={<EngineIcon size={18} />} titulo="Motores (0)" acao={<Cadastrar />}>
          <p className="px-4 pb-3 pt-1 text-sm text-text-tertiary">Nenhum motor ainda. Cadastre o primeiro.</p>
        </CartaoSecao>
      )}

      {buscando && r.motores.length === 0 && r.ordens.length === 0 && (
        <div className="flex flex-col items-start gap-3 px-1" role="status">
          <p className="text-sm text-text-tertiary">
            {q.trim() !== "" ? `Nenhum resultado para “${q.trim()}”` : "Nenhum motor com esses filtros"}
          </p>
          <div className="flex gap-2">
            <Button asChild variant="secondary">
              <Link href="/motores">Limpar busca</Link>
            </Button>
            <Cadastrar />
          </div>
        </div>
      )}

      {r.motores.length > 0 && (
        <CartaoSecao
          rotulo="Motores"
          icone={<EngineIcon size={18} />}
          titulo={`Motores (${r.motores.length})`}
          acao={<Cadastrar />}
        >
          <ul>
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
        </CartaoSecao>
      )}

      {r.ordens.length > 0 && (
        <CartaoSecao
          rotulo="Ordens de serviço"
          icone={<ClipboardTextIcon size={18} />}
          titulo={`Ordens de serviço (${r.ordens.length})`}
        >
          <ul>
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
        </CartaoSecao>
      )}
    </>
  )
}
