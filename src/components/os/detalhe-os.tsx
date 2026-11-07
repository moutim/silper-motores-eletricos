import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CameraIcon, WrenchIcon } from "@phosphor-icons/react/ssr"
import { CartaoSecao } from "@/components/layout/cartao-secao"
import { CartaoLinhas } from "@/components/motores/ficha/info"
import { formatarData, formatarMoeda } from "@/lib/format"
import { nomeCurto } from "@/lib/motor-format"
import { compararRetrato } from "@/lib/retrato-diff"
import type { Bobinagem, Motor, OrdemServico } from "@/lib/types"
import { AdicionarFotos } from "@/components/fotos/adicionar-fotos"
import { type FotoView, GradeFotos } from "@/components/fotos/grade-fotos"
import { DadosTecnicosOS } from "./dados-tecnicos-os"
import { SeletorOS } from "./seletor-os"

/**
 * Conteúdo da O.S. aberta (3.5 e 3.6; no desktop, o painel de 4.4): cartão com a primeira foto da O.S. ou, sem foto, a prancheta animada
 * (3D permitido neste ponto), dados do serviço, dados técnicos e fotos.
 */
export function DetalheOS({
  os,
  motor,
  bobinagensAtuais,
  fotos,
  ordens,
}: {
  os: OrdemServico
  motor: Motor
  bobinagensAtuais: Bobinagem[]
  /** Fotos desta O.S. (tipo serviço). */
  fotos: FotoView[]
  /** O.S. do motor: com elas, o título vira o seletor de O.S. (aba da ficha, desktop). */
  ordens?: OrdemServico[]
}) {
  const comparacao = compararRetrato(os.retratoTecnico, motor, bobinagensAtuais)
  const fichaHref = `/motores/${encodeURIComponent(motor.rastreio)}`
  const bloqueado = !motor.ativo

  return (
    <div className="flex flex-col">
      <section aria-label="Ordem de serviço" className="rounded-card bg-surface p-3.5 md:px-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-5">
            <div className="flex h-[68px] w-24 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-fill md:h-[104px] md:w-[148px]">
              {fotos[0] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`/api/fotos/${fotos[0].id}`}
                  alt={fotos[0].alt}
                  decoding="async"
                  className="size-full object-cover"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src="/assets/os-prancheta-animada.svg"
                  alt="Prancheta de ordem de serviço"
                  width={80}
                  height={53}
                  className="h-[53px] w-20 md:h-[78px] md:w-[118px]"
                />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-[17px] font-bold leading-[1.15] tracking-[-0.02em] md:text-xl">O.S. {os.numero}</h2>
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
          <div className="flex gap-2">
            {ordens && <SeletorOS ordens={ordens} atual={os} rastreio={motor.rastreio} podeCriar={!bloqueado} />}
            <Button
              asChild={!bloqueado}
              variant="secondary"
              disabled={bloqueado}
              className="h-[42px] flex-1 text-[13px] md:flex-none md:px-6"
            >
              {bloqueado ? <span>Editar O.S.</span> : <Link href={`/os/${os.id}/editar`}>Editar O.S.</Link>}
            </Button>
          </div>
        </div>
      </section>

      <div className="mt-3 grid gap-3 md:mt-5 md:grid-cols-2 md:grid-rows-[auto_1fr] md:items-start md:gap-5">
      <div className="md:col-start-1">
        <CartaoSecao titulo="Serviço" icone={<WrenchIcon size={18} />} acao={null}>
          <CartaoLinhas
            dentroDeCartao
            linhas={[
          { rotulo: "Entrada", valor: formatarData(os.dataEntrada) },
          { rotulo: "Defeito", valor: os.defeito },
          { rotulo: "Executado", valor: os.servicoExecutado },
          { rotulo: "Observações", valor: os.observacoes },
          { rotulo: "Valor da nota", valor: os.valorNota === null ? null : formatarMoeda(os.valorNota) },
            ]}
          />
        </CartaoSecao>
      </div>

      <div className="md:col-start-2 md:row-span-2 md:row-start-1">
        <DadosTecnicosOS
          naAbertura={comparacao.naAbertura}
          fichaAtual={comparacao.fichaAtual}
          houveMudanca={comparacao.houveMudanca}
        />
      </div>

      <div className="md:col-start-1">
        <CartaoSecao titulo="Fotos desta O.S." icone={<CameraIcon size={18} />} acao={null}>
          <div className="px-4 pb-3 pt-1">
            <GradeFotos fotos={fotos} podeExcluir={!bloqueado}>
              {!bloqueado && (
                <AdicionarFotos ladrilho destino={{ rastreio: motor.rastreio, tipo: "SERVICO", osId: os.id }} />
              )}
            </GradeFotos>
            {fotos.length === 0 && bloqueado && <p className="text-sm text-text-tertiary">Nenhuma foto.</p>}
          </div>
        </CartaoSecao>
      </div>
      </div>
    </div>
  )
}
