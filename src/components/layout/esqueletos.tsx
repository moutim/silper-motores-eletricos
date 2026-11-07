import { Skeleton as B } from "@/components/ui/skeleton"

/**
 * Esqueletos de carregamento: cada um tem a forma da tela que vai aparecer (mesmos cartões, linhas,
 * alturas e colunas), para a página não "pular" quando os dados chegam. Todos usam o brilho do `Skeleton`.
 */

const Carregando = () => (
  <span role="status" className="sr-only">
    Carregando...
  </span>
)

/** Barra de busca (e o botão Filtros no desktop). */
export function EsqueletoBusca() {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-12 flex-1 items-center gap-3 rounded-[16px] bg-surface px-4 md:h-[52px]">
        <B className="size-4 shrink-0 rounded-full" />
        <B className="h-3.5 w-56 max-w-full" />
      </div>
      <div className="hidden h-[52px] w-[104px] items-center justify-center gap-2 rounded-[16px] bg-surface md:flex">
        <B className="size-4 rounded-[4px]" />
        <B className="h-3.5 w-12" />
      </div>
    </div>
  )
}

function TituloCartao({ largura = "w-32", acao }: { largura?: string; acao?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-4">
      <div className="flex items-center gap-2">
        <B className="size-[18px] rounded-[5px]" />
        <B className={`h-4 ${largura}`} />
      </div>
      {acao && <B className="h-10 w-[104px] rounded-full md:h-9" />}
    </div>
  )
}

/** Linha de lista: ícone de 30 px, duas linhas de texto, valor à direita e seta. */
function LinhaLista({ ultima, direita = "w-16" }: { ultima?: boolean; direita?: string }) {
  return (
    <div className={`mx-4 ${ultima ? "" : "border-b border-separator"}`}>
      <div className="flex items-center gap-3 py-2.5">
        <B className="size-[30px] shrink-0 rounded-[8px]" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <B className="h-3.5 w-28" />
          <B className="h-3 w-44 max-w-full" />
        </div>
        <B className={`h-3 ${direita}`} />
        <B className="h-3 w-2 rounded-[3px]" />
      </div>
    </div>
  )
}

/** Cartão de seção com linhas de lista (motores, O.S.). */
export function EsqueletoCartaoLista({
  linhas,
  acao,
  titulo,
  className = "",
}: {
  linhas: number
  acao?: boolean
  titulo?: string
  className?: string
}) {
  return (
    <div className={`overflow-hidden rounded-card bg-surface pb-1 ${className}`}>
      <TituloCartao acao={acao} largura={titulo} />
      {Array.from({ length: linhas }, (_, i) => (
        <LinhaLista key={i} ultima={i === linhas - 1} />
      ))}
    </div>
  )
}

/** Cartão de seção com linhas "rótulo ... valor" (dados gerais, bobinagem, serviço). */
export function EsqueletoCartaoInfo({
  linhas,
  largura,
  className = "",
  children,
}: {
  linhas: number
  largura?: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div className={`overflow-hidden rounded-card bg-surface pb-2 ${className}`}>
      <TituloCartao largura={largura} />
      {children}
      {Array.from({ length: linhas }, (_, i) => (
        <div
          key={i}
          className={`mx-4 flex items-center justify-between gap-6 py-[13px] ${i === linhas - 1 ? "" : "border-b border-separator"}`}
        >
          <B className="h-3.5 w-24" />
          <B className={`h-3.5 ${i % 3 === 0 ? "w-28" : i % 3 === 1 ? "w-16" : "w-20"}`} />
        </div>
      ))}
    </div>
  )
}

/** Telas de lista (/motores e /os): busca e um cartão com título, botão Cadastrar e linhas. */
export function EsqueletoListaPagina({ linhas = 8 }: { linhas?: number }) {
  return (
    <>
      <Carregando />
      <EsqueletoBusca />
      <EsqueletoCartaoLista linhas={linhas} acao titulo="w-36" />
    </>
  )
}

/** Início: atalhos, quatro indicadores e as duas listas. */
export function EsqueletoInicio() {
  return (
    <>
      <Carregando />
      <EsqueletoBusca />
      <div className="grid grid-cols-2 gap-[10px] md:grid-cols-4 md:gap-4">
        {["md:col-span-2", "", "max-md:hidden"].map((c, i) => (
          <div key={i} className={`flex h-[110px] flex-col justify-between rounded-card bg-surface p-4 md:h-[132px] ${c}`}>
            <B className="size-8 rounded-[8px]" />
            <div className="flex flex-col gap-2">
              <B className="h-3.5 w-28" />
              <B className="h-3 w-40 max-w-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-[10px] md:grid-cols-4 md:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex h-[112px] flex-col justify-between rounded-card bg-surface p-4 md:h-[136px]">
            <B className="size-8 rounded-[8px]" />
            <div className="flex flex-col gap-2">
              <B className="h-6 w-24" />
              <B className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-[10px] md:grid-cols-2 md:items-start md:gap-4">
        <EsqueletoCartaoLista linhas={5} titulo="w-36" />
        <EsqueletoCartaoLista linhas={4} titulo="w-24" className="max-md:hidden" />
      </div>
    </>
  )
}

/** Cartão de topo da ficha do motor / da O.S.: imagem, nome, selo, subtítulo e botões. */
export function EsqueletoCartaoTopo({ botoes = 3 }: { botoes?: number }) {
  return (
    <div className="rounded-card bg-surface p-3.5 md:px-5 md:py-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-5">
          <B className="h-[68px] w-24 shrink-0 rounded-[12px] md:h-[104px] md:w-[148px]" />
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-3">
              <B className="h-5 w-40 md:h-6 md:w-52" />
              <B className="h-6 w-24 rounded-full" />
            </div>
            <B className="h-3.5 w-52 max-w-full" />
          </div>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: botoes }, (_, i) => (
            <B
              key={i}
              className={i === botoes - 1 && botoes === 3 ? "size-[42px] shrink-0 rounded-full" : "h-[42px] flex-1 rounded-full md:w-28 md:flex-none"}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function Abas() {
  return (
    <div className="mt-1 flex gap-5 border-b border-separator px-1 md:mt-5 md:gap-7">
      {["w-20", "w-24", "w-28"].map((w, i) => (
        <div key={i} className="flex min-h-11 items-center">
          <B className={`h-3.5 ${w}`} />
        </div>
      ))}
    </div>
  )
}

function Fotos({ grupos = 2 }: { grupos?: number }) {
  return (
    <div className="overflow-hidden rounded-card bg-surface pb-4">
      <TituloCartao largura="w-32" />
      <div className="flex flex-col gap-5 px-4">
        {Array.from({ length: grupos }, (_, g) => (
          <div key={g} className="flex flex-col gap-2">
            <B className="h-3 w-24" />
            <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
              {[0, 1, 2].map((i) => (
                <B key={i} className="aspect-square w-full rounded-[12px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Dados técnicos do desktop da O.S.: alternador e as seções de linhas. */
function DadosTecnicosOS() {
  return (
    <div className="overflow-hidden rounded-card bg-surface pb-2">
      <TituloCartao largura="w-44" />
      <div className="px-4 pb-1 pt-1">
        <B className="h-10 w-full rounded-[10px] md:h-10" />
        <B className="mt-2 h-3 w-3/4" />
      </div>
      <B className="mx-4 mb-1 mt-3 h-3 w-24" />
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className={`mx-4 flex items-center justify-between gap-6 py-[13px] ${i === 8 ? "" : "border-b border-separator"}`}>
          <B className="h-3.5 w-28" />
          <B className={`h-3.5 ${i % 2 ? "w-16" : "w-24"}`} />
        </div>
      ))}
    </div>
  )
}

/** Conteúdo de uma O.S. aberta: cartão de topo e, no desktop, serviço e fotos de um lado e dados técnicos do outro. */
export function EsqueletoDetalheOS() {
  return (
    <div className="flex flex-col">
      <EsqueletoCartaoTopo botoes={2} />
      <div className="mt-3 grid gap-3 md:mt-5 md:grid-cols-2 md:items-start md:gap-5">
        <div className="flex flex-col gap-3 md:gap-5">
          <EsqueletoCartaoInfo linhas={5} largura="w-20" />
          <div className="overflow-hidden rounded-card bg-surface pb-4">
            <TituloCartao largura="w-36" />
            <div className="px-4">
              <B className="aspect-square w-[88px] rounded-[12px] md:w-[120px]" />
            </div>
          </div>
        </div>
        <DadosTecnicosOS />
      </div>
    </div>
  )
}

/** Painel de uma aba da ficha (também usado ao trocar de aba): a forma da aba de destino. */
export function EsqueletoAbaFicha({ aba }: { aba: "dados" | "os" | "fotos" }) {
  return (
    <>
      {aba === "dados" && (
        <div className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_340px] md:items-start md:gap-5">
          <EsqueletoCartaoInfo linhas={10} largura="w-28" />
          <EsqueletoCartaoInfo linhas={5} largura="w-24" />
          <EsqueletoCartaoLista linhas={3} titulo="w-28" className="max-md:hidden" />
        </div>
      )}
      {aba === "os" && (
        <>
          <EsqueletoCartaoLista linhas={4} titulo="w-40" className="md:hidden" />
          <div className="max-md:hidden">
            <EsqueletoDetalheOS />
          </div>
        </>
      )}
      {aba === "fotos" && <Fotos />}
    </>
  )
}

/** Ficha do motor inteira: cartão de topo, abas e o painel da aba aberta. */
export function EsqueletoFicha({ aba = "dados" }: { aba?: "dados" | "os" | "fotos" }) {
  return (
    <div className="flex flex-col gap-3 md:gap-0">
      <Carregando />
      <EsqueletoCartaoTopo />
      <Abas />
      <div className="mt-1 md:mt-5">
        <EsqueletoAbaFicha aba={aba} />
      </div>
    </div>
  )
}

/** Página de uma O.S. (`/os/[id]`). */
export function EsqueletoOSAberta() {
  return (
    <>
      <Carregando />
      <EsqueletoDetalheOS />
    </>
  )
}

/** Conta do menu lateral: foto, nome, e-mail e botão Sair. */
export function EsqueletoConta() {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <B className="size-8 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <B className="h-3 w-24" />
        <B className="h-2.5 w-32 max-w-full" />
      </div>
      <B className="size-8 shrink-0 rounded-[8px]" />
    </div>
  )
}
