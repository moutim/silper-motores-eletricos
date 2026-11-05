import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CartaoLinhas, TituloBloco } from "@/components/motores/ficha/info"
import { formatarData, formatarMoeda } from "@/lib/format"
import { nomeCurto } from "@/lib/motor-format"
import { compararRetrato } from "@/lib/retrato-diff"
import type { Bobinagem, Motor, OrdemServico } from "@/lib/types"
import { TituloSecao } from "@/components/motores/campos"
import { DadosTecnicosOS } from "./dados-tecnicos-os"

/**
 * Conteúdo da O.S. aberta (3.5 e 3.6; no desktop, o painel de 4.4): cartão com a prancheta animada
 * (3D permitido neste ponto), dados do serviço, dados técnicos e fotos.
 */
export function DetalheOS({
  os,
  motor,
  bobinagensAtuais,
  paginaPropria,
}: {
  os: OrdemServico
  motor: Motor
  bobinagensAtuais: Bobinagem[]
  /** Na página `/os/[id]` o título da O.S. é o h1 do desktop; dentro da ficha é um h2. */
  paginaPropria?: boolean
}) {
  const comparacao = compararRetrato(os.retratoTecnico, motor, bobinagensAtuais)
  const fichaHref = `/motores/${encodeURIComponent(motor.rastreio)}`
  const bloqueado = !motor.ativo

  return (
    <div className="flex flex-col">
      <section aria-label="Ordem de serviço" className="rounded-card bg-surface p-3.5 md:px-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-5">
            <div className="flex shrink-0 rounded-[12px] bg-fill px-2 py-1.5 md:px-2.5 md:py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/os-prancheta-animada.svg"
                alt="Prancheta de ordem de serviço"
                width={80}
                height={53}
                className="h-[53px] w-20 md:h-[73px] md:w-[110px]"
              />
            </div>
            <div className="min-w-0">
              {paginaPropria ? (
                <>
                  <h1 className="hidden text-xl font-bold leading-[1.15] tracking-[-0.02em] md:block">O.S. {os.numero}</h1>
                  <p className="text-[17px] font-bold leading-[1.15] tracking-[-0.02em] md:hidden">O.S. {os.numero}</p>
                </>
              ) : (
                <h2 className="text-[17px] font-bold leading-[1.15] tracking-[-0.02em] md:text-xl">O.S. {os.numero}</h2>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Link href={fichaHref} aria-label={`Abrir ficha do motor ${motor.rastreio}`}>
                  <Badge className="bg-orange-light text-orange-text tabular-nums">{motor.rastreio}</Badge>
                </Link>
                <span className="hidden text-[13px] text-text-tertiary md:inline">Entrada {formatarData(os.dataEntrada)}</span>
              </div>
              <p className="mt-1 text-xs text-text-tertiary md:text-[13px]">
                {nomeCurto(motor)} · {motor.clienteNome}
              </p>
            </div>
          </div>
          <Button
            asChild={!bloqueado}
            variant="secondary"
            disabled={bloqueado}
            className="h-[42px] w-full text-[13px] md:w-auto md:px-6"
          >
            {bloqueado ? <span>Editar O.S.</span> : <Link href={`/os/${os.id}/editar`}>Editar O.S.</Link>}
          </Button>
        </div>
      </section>

      <TituloBloco>Serviço</TituloBloco>
      <CartaoLinhas
        linhas={[
          { rotulo: "Entrada", valor: formatarData(os.dataEntrada) },
          { rotulo: "Defeito", valor: os.defeito },
          { rotulo: "Executado", valor: os.servicoExecutado },
          { rotulo: "Observações", valor: os.observacoes },
          { rotulo: "Valor da nota", valor: os.valorNota === null ? null : formatarMoeda(os.valorNota) },
        ]}
      />

      <div className="mt-5">
        <DadosTecnicosOS
          naAbertura={comparacao.naAbertura}
          fichaAtual={comparacao.fichaAtual}
          houveMudanca={comparacao.houveMudanca}
        />
      </div>

      <section className="mt-5 flex flex-col gap-2" aria-label="Fotos desta O.S.">
        <TituloSecao>Fotos desta O.S.</TituloSecao>
        <div
          aria-disabled="true"
          className="flex h-16 items-center justify-between rounded-field border border-dashed border-separator-opaque px-3 text-[13px] text-text-tertiary opacity-70"
        >
          Nenhuma foto ainda
          <span className="text-xs">Em breve</span>
        </div>
      </section>
    </div>
  )
}
