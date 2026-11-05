import { config } from "./config"
import { semAcento } from "./format"
import { formatarPotencia } from "./motor-format"
import { ordenarOS } from "./os-ordem"
import type { Motor, OrdemServico } from "./types"

/** Filtros avançados (doc 01, 5.6). Cada um é um valor exato escolhido na lista; vazio = sem filtro. */
export const FILTROS = [
  { chave: "marca", rotulo: "Marca" },
  { chave: "potencia", rotulo: "Potência" },
  { chave: "rpm", rotulo: "RPM" },
  { chave: "tensao", rotulo: "Tensão" },
  { chave: "pacote", rotulo: "Pacote" },
  { chave: "diametro", rotulo: "Diâmetro" },
  { chave: "tipo", rotulo: "Tipo de equipamento" },
] as const

export type ChaveFiltro = (typeof FILTROS)[number]["chave"]
export type Filtros = Partial<Record<ChaveFiltro, string>>
export type OpcoesFiltros = Record<ChaveFiltro, string[]>

export interface ResultadoOS {
  os: OrdemServico
  motor: Motor
}

export interface ResultadoBusca {
  motores: Motor[]
  ordens: ResultadoOS[]
}

/** Texto normalizado para comparar (sem acento, minúsculas, espaços recolhidos). */
const norm = (t: string | null | undefined) => semAcento(t ?? "").replace(/\s+/g, " ")

/** "5 CV" (a mesma forma que aparece na tela), ou `null` sem potência. */
export function potenciaDoMotor(m: Pick<Motor, "potenciaValor" | "potenciaUnidade">): string | null {
  return m.potenciaValor === null ? null : formatarPotencia(m.potenciaValor, m.potenciaUnidade)
}

const valorDoFiltro: Record<ChaveFiltro, (m: Motor) => string | null> = {
  marca: (m) => m.marca,
  potencia: potenciaDoMotor,
  rpm: (m) => m.rpm,
  tensao: (m) => m.tensao,
  pacote: (m) => m.pacote,
  diametro: (m) => m.diametro,
  tipo: (m) => m.tipoEquipamento,
}

/** Todos os campos pesquisáveis do motor em um só texto (rastreio, cliente, marca, modelo, potência, tensão, RPM, pacote, diâmetro e tipo). */
export function textoDoMotor(m: Motor): string {
  const potencia = potenciaDoMotor(m)
  const bruto = m.potenciaValor === null ? null : String(m.potenciaValor).replace(".", ",")
  return norm(
    [
      m.rastreio, m.clienteNome, m.marca, m.modelo, m.tipoEquipamento, potencia, bruto,
      m.tensao, m.corrente, m.rpm, m.pacote, m.diametro,
    ]
      .filter((x) => x !== null && x !== "")
      .join(" "),
  )
}

/** Termos da busca: separados por espaço, sem acento, sem repetição. Todos precisam aparecer (E). */
export function termosDaBusca(q: string): string[] {
  return [...new Set(norm(q).split(" ").filter(Boolean))]
}

export function passaFiltros(m: Motor, filtros: Filtros): boolean {
  return FILTROS.every(({ chave }) => {
    const pedido = norm(filtros[chave])
    return pedido === "" || norm(valorDoFiltro[chave](m)) === pedido
  })
}

export function temFiltros(filtros: Filtros): boolean {
  return FILTROS.some(({ chave }) => (filtros[chave] ?? "").trim() !== "")
}

/**
 * Busca em memória (doc 01, 5.6; D-09). Motores: casam pelos campos do motor. O.S.: casam pelo número
 * da O.S. mais os campos do motor dela ("4821 weg" acha a O.S. 4821 do motor WEG). Sem termo, não há
 * O.S.: a tela mostra só os motores mais recentes. Os filtros avançados valem para os dois grupos.
 */
export function buscar(
  motores: Motor[],
  ordens: OrdemServico[],
  q: string,
  filtros: Filtros = {},
  opcoes: { incluirDesativados?: boolean } = {},
): ResultadoBusca {
  const termos = termosDaBusca(q)
  const candidatos = motores.filter((m) => (opcoes.incluirDesativados ?? true) || m.ativo).filter((m) => passaFiltros(m, filtros))
  const textos = new Map(candidatos.map((m) => [m.id, textoDoMotor(m)]))

  const casa = (texto: string) => termos.every((t) => texto.includes(t))
  const achados = candidatos
    .filter((m) => casa(textos.get(m.id) as string))
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))

  if (termos.length === 0) return { motores: achados, ordens: [] }

  const porId = new Map(candidatos.map((m) => [m.id, m]))
  const achadasOS = ordenarOS(ordens).flatMap((os) => {
    const motor = porId.get(os.motorId)
    if (!motor) return []
    return casa(`${norm(os.numero)} ${textos.get(motor.id)}`) ? [{ os, motor }] : []
  })
  return { motores: achados, ordens: achadasOS }
}

/** Valores existentes de cada filtro, sem repetição e em ordem natural (2 antes de 10). */
export function opcoesDosFiltros(motores: Motor[]): OpcoesFiltros {
  const resultado = {} as OpcoesFiltros
  for (const { chave } of FILTROS) {
    const vistos = new Map<string, string>()
    for (const m of motores) {
      const v = valorDoFiltro[chave](m)?.trim()
      if (v && !vistos.has(norm(v))) vistos.set(norm(v), v)
    }
    resultado[chave] = [...vistos.values()].sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }))
  }
  return resultado
}

/** Parâmetros da URL de /motores: `q`, os filtros e `pm`/`po` (quantas "páginas" de 20 mostrar). */
export interface ParametrosBusca {
  q: string
  filtros: Filtros
  paginasMotores: number
  paginasOS: number
}

type ParamsBrutos = Record<string, string | string[] | undefined>

const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ""

function paginas(v: string | string[] | undefined): number {
  const n = Number.parseInt(um(v), 10)
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 500) : 1
}

export function lerParametros(params: ParamsBrutos): ParametrosBusca {
  const filtros: Filtros = {}
  for (const { chave } of FILTROS) {
    const v = um(params[chave]).trim()
    if (v) filtros[chave] = v.slice(0, 80)
  }
  return {
    q: um(params.q).slice(0, 200),
    filtros,
    paginasMotores: paginas(params.pm),
    paginasOS: paginas(params.po),
  }
}

/** Monta "?q=...&marca=..." (vazio quando não há nada). */
export function montarQuery(p: Partial<ParametrosBusca>): string {
  const sp = new URLSearchParams()
  if (p.q?.trim()) sp.set("q", p.q)
  for (const { chave } of FILTROS) {
    const v = p.filtros?.[chave]?.trim()
    if (v) sp.set(chave, v)
  }
  if (p.paginasMotores && p.paginasMotores > 1) sp.set("pm", String(p.paginasMotores))
  if (p.paginasOS && p.paginasOS > 1) sp.set("po", String(p.paginasOS))
  const s = sp.toString()
  return s ? `?${s}` : ""
}

export const POR_GRUPO = config.busca.maxPorGrupo
