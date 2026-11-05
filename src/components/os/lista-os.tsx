import Link from "next/link"
import { Button } from "@/components/ui/button"
import { config } from "@/lib/config"
import { listarOS, mesDaUrl, mesesDasOS } from "@/lib/os-lista"
import { carregarBase } from "@/server/busca"
import { BarraBuscaOS } from "./barra-busca-os"
import { LinhaOSMotor } from "./linha-os-motor"

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

      {todas.length === 0 ? (
        <div className="flex flex-col items-start gap-3 px-1">
          <p className="text-sm text-text-tertiary">
            {filtrando ? "Nenhuma O.S. com esses filtros." : "Nenhuma O.S. ainda. Abra uma pela ficha de um motor."}
          </p>
          {filtrando ? (
            <Button asChild variant="secondary">
              <Link href="/os">Limpar busca</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/motores">Ir para Motores</Link>
            </Button>
          )}
        </div>
      ) : (
        <section className="flex flex-col gap-2" aria-label="Ordens de serviço">
          <div className="flex items-baseline justify-between px-4 md:px-1">
            <h2 className="text-xs font-medium uppercase tracking-[0.02em] text-text-tertiary">
              Ordens de serviço ({todas.length})
            </h2>
            <span className="text-xs text-text-tertiary">
              <span className="md:hidden">Toque para abrir</span>
              <span className="max-md:hidden">Clique para abrir</span>
            </span>
          </div>
          <ul className="overflow-hidden rounded-card bg-surface">
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
            <Button asChild variant="secondary" className="self-center">
              <Link href={`/os?${sp.toString()}`} scroll={false}>
                Ver mais ({todas.length - limite})
              </Link>
            </Button>
          )}
        </section>
      )}
    </>
  )
}
