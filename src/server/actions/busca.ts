"use server"

import { buscar, FILTROS, type Filtros, opcoesDosFiltros, type OpcoesFiltros } from "@/lib/busca"
import { formularioDeModelo } from "@/lib/motor-base"
import { nomeCurto } from "@/lib/motor-format"
import type { MotorFormValues } from "@/lib/motor-schema"
import { config } from "@/lib/config"
import { contextoDaSessao } from "../contexto"
import { SheetsMotorRepository } from "../repositories/sheets-motor-repository"

/** Linha da lista "Escolher motor" (1.3): o suficiente para mostrar e escolher. */
export interface LinhaMotorBase {
  id: string
  nome: string
  clienteNome: string
  rpm: string | null
  rastreio: string
}

export type ResultadoBuscaBase =
  | { ok: true; motores: LinhaMotorBase[]; total: number; opcoes: OpcoesFiltros }
  | { ok: false; erro: string }

export type ResultadoModelo =
  | { ok: true; valores: MotorFormValues; nome: string; rastreio: string }
  | { ok: false; erro: string }

/** Só aceita as chaves e os tamanhos esperados (a entrada vem do navegador). */
function limparFiltros(f: Filtros): Filtros {
  const limpo: Filtros = {}
  for (const { chave } of FILTROS) {
    const v = typeof f?.[chave] === "string" ? f[chave].trim().slice(0, 80) : ""
    if (v) limpo[chave] = v
  }
  return limpo
}

/** Busca para escolher o motor-base: mesma regra da 5.6, só motores ativos, no máximo 20. */
export async function buscarMotoresBase(q: string, filtros: Filtros): Promise<ResultadoBuscaBase> {
  try {
    const { planilha } = await contextoDaSessao()
    const motores = await new SheetsMotorRepository(planilha).listar()
    const r = buscar(motores, [], String(q ?? "").slice(0, 200), limparFiltros(filtros), { incluirDesativados: false })
    return {
      ok: true,
      total: r.motores.length,
      motores: r.motores.slice(0, config.busca.maxPorGrupo).map((m) => ({
        id: m.id,
        nome: nomeCurto(m),
        clienteNome: m.clienteNome,
        rpm: m.rpm,
        rastreio: m.rastreio,
      })),
      opcoes: opcoesDosFiltros(motores.filter((m) => m.ativo)),
    }
  } catch (e) {
    console.error("[buscarMotoresBase]", e)
    return { ok: false, erro: "Não foi possível buscar. Tente de novo." }
  }
}

/** Dados técnicos e bobinagem do motor-base para preencher o formulário (RN-10). Não copia cliente, O.S. nem fotos. */
export async function carregarModelo(motorId: string): Promise<ResultadoModelo> {
  try {
    const { planilha } = await contextoDaSessao()
    const repo = new SheetsMotorRepository(planilha)
    const modelo = (await repo.listar()).find((m) => m.id === motorId && m.ativo)
    if (!modelo) return { ok: false, erro: "Este motor não está mais disponível. Escolha outro." }
    const bobinagens = await repo.bobinagensDoMotor(modelo.id)
    return { ok: true, valores: formularioDeModelo(modelo, bobinagens), nome: nomeCurto(modelo), rastreio: modelo.rastreio }
  } catch (e) {
    console.error("[carregarModelo]", e)
    return { ok: false, erro: "Não foi possível carregar o motor. Tente de novo." }
  }
}
