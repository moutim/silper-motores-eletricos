"use client"

import { CaretDownIcon, CheckIcon, EngineIcon, SpinnerIcon, XIcon } from "@phosphor-icons/react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIsMobile } from "@/hooks/use-mobile"
import { config } from "@/lib/config"
import { FILTROS, type ChaveFiltro, type Filtros, type OpcoesFiltros } from "@/lib/busca"
import type { MotorFormValues } from "@/lib/motor-schema"
import { buscarMotoresBase, carregarModelo, type LinhaMotorBase } from "@/server/actions/busca"
import { TituloSecao } from "./campos"

export interface BaseEscolhida {
  id: string
  nome: string
  rastreio: string
}

interface Props {
  base: BaseEscolhida | null
  /** Recebe os dados técnicos e a bobinagem do motor escolhido (o cliente não vem: RN-10). */
  aoUsar: (base: BaseEscolhida, valores: MotorFormValues) => void
  aoRemover: () => void
  /** Abre a lista ao montar (atalho "Copiar de outro motor" da Início). */
  abrirInicialmente?: boolean
  desabilitado?: boolean
}

/** Filtros em cápsulas do celular (doc 03, 1.3): Potência, Marca, RPM e Pacote. */
const CAPSULAS: ChaveFiltro[] = ["potencia", "marca", "rpm", "pacote"]
const TODOS = "__todos"

interface Resultado {
  chave: string
  motores: LinhaMotorBase[]
  total: number
  opcoes: OpcoesFiltros | null
  erro: boolean
}

/** Busca no servidor (mesma regra da 5.6, só motores ativos) com espera de 250 ms. */
function useBuscaBase(ativo: boolean, q: string, filtros: Filtros) {
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const chave = JSON.stringify([q, filtros])
  const ultimaOpcoes = useRef<OpcoesFiltros | null>(null)

  useEffect(() => {
    if (!ativo) return
    let cancelado = false
    const t = setTimeout(
      async () => {
        let r: Resultado
        try {
          const dados = await buscarMotoresBase(q, filtros)
          if (dados.ok) {
            ultimaOpcoes.current = dados.opcoes
            r = { chave, motores: dados.motores, total: dados.total, opcoes: dados.opcoes, erro: false }
          } else r = { chave, motores: [], total: 0, opcoes: ultimaOpcoes.current, erro: true }
        } catch {
          r = { chave, motores: [], total: 0, opcoes: ultimaOpcoes.current, erro: true }
        }
        if (!cancelado) setResultado(r)
      },
      resultado === null ? 0 : config.busca.esperaMs,
    )
    return () => {
      cancelado = true
      clearTimeout(t)
    }
    // `resultado` só decide a espera da primeira busca; não deve disparar nova busca.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo, chave])

  return { resultado, carregando: ativo && resultado?.chave !== chave }
}

function ConteudoLinha({ m }: { m: LinhaMotorBase }) {
  return (
    <>
      <span
        className="flex size-[30px] shrink-0 items-center justify-center rounded-[8px] bg-[#3A55B6] text-white"
        aria-hidden="true"
      >
        <EngineIcon size={18} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-semibold">{m.nome}</span>
        <span className="block truncate text-xs text-text-tertiary">
          {[m.clienteNome, m.rpm && `${m.rpm} RPM`].filter(Boolean).join(" · ")}
        </span>
      </span>
      <span className="shrink-0 text-xs tabular-nums text-text-tertiary">{m.rastreio}</span>
    </>
  )
}

function Capsulas({
  opcoes,
  filtros,
  aoMudar,
}: {
  opcoes: OpcoesFiltros | null
  filtros: Filtros
  aoMudar: (f: Filtros) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtros">
      {CAPSULAS.map((chave) => {
        const rotulo = FILTROS.find((f) => f.chave === chave)?.rotulo ?? chave
        const atual = filtros[chave] ?? ""
        const lista = opcoes?.[chave] ?? []
        return (
          <Select
            key={chave}
            value={atual === "" ? TODOS : atual}
            onValueChange={(v) => aoMudar({ ...filtros, [chave]: v === TODOS ? "" : v })}
          >
            <SelectTrigger
              aria-label={rotulo}
              className={`h-9 w-auto shrink-0 gap-1.5 rounded-full border-0 px-3.5 text-[13px] font-semibold ${atual ? "bg-blue-light text-blue-text" : "bg-fill"}`}
            >
              {atual ? <SelectValue /> : <span>{rotulo}</span>}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>{rotulo}: todos</SelectItem>
              {(atual && !lista.includes(atual) ? [atual, ...lista] : lista).map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      })}
    </div>
  )
}

/** Celular (1.3): gaveta com busca, cápsulas, lista, aviso sobre o cliente e barra "Usar este motor como base". */
function EscolherNoCelular({
  aoFechar,
  aoEscolher,
  carregandoModelo,
}: {
  aoFechar: () => void
  aoEscolher: (m: LinhaMotorBase) => void
  carregandoModelo: boolean
}) {
  const [q, setQ] = useState("")
  const [filtros, setFiltros] = useState<Filtros>({})
  const [selecionado, setSelecionado] = useState<LinhaMotorBase | null>(null)
  const { resultado, carregando } = useBuscaBase(true, q, filtros)

  return (
    <Drawer nested open onOpenChange={(a) => !a && aoFechar()}>
      <DrawerContent className="h-[calc(100dvh-60px)] data-[vaul-drawer-direction=bottom]:max-h-none">
        <div className="flex items-center justify-between gap-3 px-[18px] pb-3 pt-3">
          <DrawerTitle className="text-[21px] font-bold leading-[1.15] tracking-[-0.02em]">Escolher motor</DrawerTitle>
          <DrawerClose asChild>
            <button
              type="button"
              aria-label="Fechar"
              className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-fill text-text-tertiary outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <XIcon size={16} weight="bold" aria-hidden="true" />
            </button>
          </DrawerClose>
        </div>
        <DrawerDescription className="sr-only">
          Escolha um motor já cadastrado para copiar os dados técnicos e a bobinagem.
        </DrawerDescription>
        <div data-vaul-no-drag className="flex min-h-0 flex-1 flex-col gap-3 px-[18px] pb-4">
          <input
            type="search"
            aria-label="Buscar motor"
            autoComplete="off"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rastreio, cliente, marca, potência"
            className="h-12 w-full shrink-0 rounded-[16px] border border-border bg-surface px-4 text-[15px] outline-none placeholder:text-text-tertiary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Capsulas opcoes={resultado?.opcoes ?? null} filtros={filtros} aoMudar={setFiltros} />
          <div className="flex items-baseline justify-between px-1">
            <h3 className="text-xs font-medium uppercase tracking-[0.02em] text-text-tertiary" aria-live="polite">
              {resultado ? `${resultado.total} motores parecidos` : "Buscando..."}
            </h3>
            <span className="text-xs text-text-tertiary">Toque para escolher</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {resultado?.erro ? (
              <p className="px-1 text-sm text-destructive" role="alert">
                Não foi possível buscar. Tente de novo.
              </p>
            ) : resultado && resultado.motores.length === 0 && !carregando ? (
              <p className="px-1 text-sm text-text-tertiary">Nenhum motor encontrado.</p>
            ) : (
              <ul role="listbox" aria-label="Motores" className={`overflow-hidden rounded-card bg-surface ${carregando ? "opacity-60" : ""}`}>
                {resultado?.motores.map((m) => {
                  const sel = selecionado?.id === m.id
                  return (
                    <li key={m.id} role="option" aria-selected={sel}>
                      <button
                        type="button"
                        onClick={() => setSelecionado(m)}
                        className={`flex min-h-[52px] w-full items-center gap-3 px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring ${sel ? "bg-blue-light" : ""}`}
                      >
                        <ConteudoLinha m={m} />
                        {sel && <CheckIcon size={18} weight="bold" className="shrink-0 text-blue" aria-hidden="true" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
            {resultado && resultado.total > resultado.motores.length && (
              <p className="px-1 pt-2 text-xs text-text-tertiary">
                Mostrando {resultado.motores.length} de {resultado.total}. Refine a busca para achar o motor.
              </p>
            )}
          </div>
          <p className="shrink-0 px-1 text-xs text-text-tertiary">
            O cliente não é copiado: você informa o cliente do novo motor.
          </p>
        </div>
        <div className="flex gap-2.5 border-t border-separator-subtle px-[18px] py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          <Button type="button" className="flex-1" disabled={!selecionado || carregandoModelo} onClick={() => selecionado && aoEscolher(selecionado)}>
            {carregandoModelo && <SpinnerIcon className="animate-spin" aria-hidden="true" />}
            Usar este motor como base
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

/** Desktop: lista em painel suspenso (Command em Popover) dentro da janela de novo motor. */
function ListaNoPopover({ aoEscolher }: { aoEscolher: (m: LinhaMotorBase) => void }) {
  const [q, setQ] = useState("")
  const { resultado, carregando } = useBuscaBase(true, q, {})
  return (
    <Command shouldFilter={false} aria-label="Escolher motor-base">
      <CommandInput value={q} onValueChange={setQ} placeholder="Rastreio, cliente, marca, potência" aria-label="Buscar motor" />
      <CommandList className="max-h-[280px]">
        {resultado?.erro ? (
          <p className="px-3 py-6 text-center text-sm text-destructive" role="alert">
            Não foi possível buscar. Tente de novo.
          </p>
        ) : carregando && !resultado ? (
          <p className="px-3 py-6 text-center text-sm text-text-tertiary">Buscando...</p>
        ) : (
          <>
            {!carregando && <CommandEmpty>Nenhum motor encontrado.</CommandEmpty>}
            <CommandGroup heading={resultado ? `${resultado.total} motores parecidos` : undefined}>
              {resultado?.motores.map((m) => (
                <CommandItem key={m.id} value={m.id} onSelect={() => aoEscolher(m)} className="gap-3 py-2">
                  <ConteudoLinha m={m} />
                </CommandItem>
              ))}
            </CommandGroup>
            {resultado && resultado.total > resultado.motores.length && (
              <p className="px-3 pb-2 text-xs text-text-tertiary">
                Mostrando {resultado.motores.length} de {resultado.total}. Digite para refinar.
              </p>
            )}
          </>
        )}
      </CommandList>
    </Command>
  )
}

/**
 * "Partir de um motor já cadastrado (opcional)" (doc 03, 1.3 e 1.4). Sem base: botão que abre a lista.
 * Com base: cartão "Base do cadastro" com "Trocar" e a nota do que é e do que não é copiado (RN-10).
 */
export function EscolherBase({ base, aoUsar, aoRemover, abrirInicialmente = false, desabilitado }: Props) {
  const celular = useIsMobile()
  const [aberto, setAberto] = useState(abrirInicialmente)
  const [carregandoModelo, setCarregandoModelo] = useState(false)

  async function escolher(m: LinhaMotorBase) {
    setCarregandoModelo(true)
    try {
      const r = await carregarModelo(m.id)
      if (!r.ok) {
        toast.error(r.erro)
        return
      }
      aoUsar({ id: m.id, nome: r.nome, rastreio: r.rastreio }, r.valores)
      setAberto(false)
    } catch {
      toast.error("Sem conexão. Verifique a internet e tente de novo.")
    } finally {
      setCarregandoModelo(false)
    }
  }

  const botao = (
    <button
      type="button"
      disabled={desabilitado}
      onClick={celular ? () => setAberto(true) : undefined}
      aria-haspopup="dialog"
      aria-expanded={aberto}
      className="flex h-11 w-full items-center justify-between rounded-field border border-border bg-surface px-3 text-[13.5px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 md:h-10 md:text-[13px]"
    >
      {base ? "Trocar motor-base" : "Escolher motor-base"}
      {carregandoModelo ? (
        <SpinnerIcon size={16} className="animate-spin text-text-tertiary" aria-hidden="true" />
      ) : (
        <CaretDownIcon size={14} className="text-text-tertiary" aria-hidden="true" />
      )}
    </button>
  )

  return (
    <section className="flex flex-col gap-2" aria-label="Motor-base">
      <TituloSecao>Partir de um motor já cadastrado (opcional)</TituloSecao>

      {base && (
        <div className="flex flex-col gap-2 rounded-[16px] bg-blue-light p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-blue-text">Base do cadastro</p>
              <p className="truncate text-sm font-bold">
                {base.nome} · {base.rastreio}
              </p>
            </div>
            <button
              type="button"
              onClick={aoRemover}
              disabled={desabilitado}
              className="shrink-0 rounded-md px-2 py-2 text-xs font-semibold text-blue-text outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Remover
            </button>
          </div>
          <p className="text-xs text-text-secondary">
            Copiados: dados técnicos e bobinagem. Não copiados: O.S., fotos e esquemas. Preencha o cliente.
          </p>
        </div>
      )}

      {celular ? (
        <>
          {botao}
          {aberto && <EscolherNoCelular aoFechar={() => setAberto(false)} aoEscolher={escolher} carregandoModelo={carregandoModelo} />}
        </>
      ) : (
        <Popover open={aberto} onOpenChange={setAberto}>
          <PopoverTrigger asChild>{botao}</PopoverTrigger>
          <PopoverContent align="start" className="w-(--radix-popover-trigger-width) gap-0 p-0">
            <ListaNoPopover aoEscolher={escolher} />
          </PopoverContent>
        </Popover>
      )}
    </section>
  )
}
