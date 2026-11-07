import { ClipboardTextIcon, PlusIcon } from "@phosphor-icons/react/ssr"
import Link from "next/link"
import { CartaoSecao } from "@/components/layout/cartao-secao"
import { Button } from "@/components/ui/button"
import { config } from "@/lib/config"
import { listarOS, mesDaUrl, mesesDasOS } from "@/lib/os-lista"
import { carregarBase } from "@/server/busca"
import { BotaoNovaOS } from "./botao-nova-os"
import { BarraBuscaOS } from "./barra-busca-os"
import { LinhaOSMotor } from "./linha-os-motor"

/** "Nova O.S." abre o seletor de motor: a O.S. fica atrelada ao motor escolhido. */
function NovaOS() {
  return (
    <BotaoNovaOS className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#3A55B6] px-4 text-sm font-semibold text-white outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring md:h-9">
      <PlusIcon size={16} weight="bold" aria-hidden="true" />
      Cadastrar
    </BotaoNovaOS>
  )
}

type Params = Record<string, string | string[] | undefined>
const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ""

/** Lista de O.S. (doc 03): busca, filtro por mês e linhas que abrem a O.S. (`/os/[id]`). 20 por vez, com "Ver mais". */
export async function ListaOS({ params }: { params: Params }) {
  const q = um(params.q).slice(0, 200)
  const mes = mesDaUrl(um(params.mes))
  const paginas = Math.min(Math.max(Number.parseInt(um(params.p), 10) || 1, 1), 500)

  const { motores, ordens } = await carregarBase()
  const todas = listarOS(motores, ordens, q, mes)
  const limite = paginas * config.busca.maxPorGrupo
  const visiveis = todas.slice(0, limite)
  const filtrando = q.trim() !== "" || mes !== ""

  const sp = new URLSearchParams()
  if (q.trim()) sp.set("q", q)
  if (mes) sp.set("mes", mes)
  sp.set("p", String(paginas + 1))

  return (
    <>
      <BarraBuscaOS q={q} mes={mes} meses={mesesDasOS(ordens)} />

      <p className="sr-only" role="status">
        {todas.length} ordens de serviço
      </p>

      {todas.length === 0 && !filtrando && (
        <CartaoSecao
          rotulo="Ordens de serviço"
          icone={<ClipboardTextIcon size={18} />}
          titulo="Ordens de serviço (0)"
          acao={<NovaOS />}
        >
          <p className="px-4 pb-3 pt-1 text-sm text-text-tertiary">Nenhuma O.S. ainda. Cadastre a primeira.</p>
        </CartaoSecao>
      )}

      {todas.length === 0 && filtrando && (
        <div className="flex flex-col items-start gap-3 px-1" role="status">
          <p className="text-sm text-text-tertiary">
            {q.trim() !== "" ? `Nenhum resultado para “${q.trim()}”` : "Nenhuma O.S. com esses filtros"}
          </p>
          <div className="flex gap-2">
            <Button asChild variant="secondary">
              <Link href="/os">Limpar busca</Link>
            </Button>
            <NovaOS />
          </div>
        </div>
      )}

      {todas.length > 0 && (
        <CartaoSecao
          rotulo="Ordens de serviço"
          icone={<ClipboardTextIcon size={18} />}
          titulo={`Ordens de serviço (${todas.length})`}
          acao={<NovaOS />}
        >
          <ul>
            {visiveis.map(({ os, motor }, i) => (
              <LinhaOSMotor
                key={os.id}
                os={os}
                motor={motor}
                ultima={i === visiveis.length - 1}
                direita="data-valor"
                href={`/os/${os.id}`}
              />
            ))}
          </ul>
          {todas.length > limite && (
            <Button asChild variant="secondary" className="mx-auto my-3 flex w-fit">
              <Link href={`/os?${sp.toString()}`} scroll={false}>
                Ver mais ({todas.length - limite})
              </Link>
            </Button>
          )}
        </CartaoSecao>
      )}
    </>
  )
}
