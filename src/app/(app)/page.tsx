import { EngineIcon } from "@phosphor-icons/react/ssr"
import type { Metadata } from "next"
import { Suspense } from "react"
import { BarraBusca } from "@/components/busca/barra-busca"
import { Atalhos } from "@/components/inicio/atalhos"
import { CartoesInfo } from "@/components/inicio/cartoes-info"
import { MotoresRecentes, UltimasOS } from "@/components/inicio/listas"
import { BotaoAcaoCartao } from "@/components/layout/botao-acao-cartao"
import { CartaoSecao } from "@/components/layout/cartao-secao"
import { EsqueletoInicio } from "@/components/layout/esqueletos"
import { PageHeader } from "@/components/layout/page-header"
import { config } from "@/lib/config"
import { carregarInicio } from "@/server/busca"

export const metadata: Metadata = { title: "Início" }

async function Conteudo() {
  const d = await carregarInicio()
  return (
    <>
      <BarraBusca q="" filtros={{}} opcoes={d.opcoes} modo="enviar" />
      <Atalhos />
      <CartoesInfo indicadores={d.indicadores} />
      {!d.temMotores && (
        <CartaoSecao
          rotulo="Motores recentes"
          icone={<EngineIcon size={18} />}
          titulo="Motores recentes (0)"
          acao={<BotaoAcaoCartao href="/motores/novo">Cadastrar</BotaoAcaoCartao>}
        >
          <p className="px-4 pb-3 pt-1 text-sm text-text-tertiary">Nenhum motor ainda. Cadastre o primeiro.</p>
        </CartaoSecao>
      )}
      {d.temMotores && (
        <div className="grid gap-[10px] md:grid-cols-2 md:items-start md:gap-4">
          <MotoresRecentes motores={d.recentes} recentesCelular={config.inicio.recentesCelular} />
          <UltimasOS ordens={d.ultimasOS} />
        </div>
      )}
    </>
  )
}

export default function Inicio() {
  return (
    <div className="flex flex-col gap-[10px] md:gap-5">
      <PageHeader titulo="Início" />
      <Suspense fallback={<EsqueletoInicio />}>
        <Conteudo />
      </Suspense>
    </div>
  )
}
