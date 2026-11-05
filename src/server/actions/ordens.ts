"use server"

import { revalidatePath } from "next/cache"
import { osFormSchema, type OSFormValues } from "@/lib/os-schema"
import { contextoDaSessao, NaoAutenticadoError } from "../contexto"
import { editarOS, criarOS } from "../os-service"
import { SheetsMotorRepository, invalidarCacheMotores } from "../repositories/sheets-motor-repository"
import { invalidarCacheOS } from "../repositories/sheets-os-repository"
import { PortaOSSheets } from "../sheets/porta-os"

export type ResultadoOSAcao = { ok: true; numero: string; id: string } | { ok: false; erro: string; conflito?: boolean }

const MSG_SESSAO = "Sua sessão expirou. Entre de novo."
const MSG_FALHA = "Não foi possível salvar. Tente de novo."
const MSG = {
  MOTOR_NAO_ENCONTRADO: "Motor não encontrado.",
  MOTOR_DESATIVADO: "Este motor está desativado. Reative para abrir ou editar O.S.",
  NAO_ENCONTRADA: "O.S. não encontrada.",
  CONFLITO: "Esta O.S. foi alterada por outra pessoa. Feche e abra de novo para ver as mudanças.",
} as const

function revalidar() {
  revalidatePath("/motores/[rastreio]", "page")
  revalidatePath("/os/[id]", "page")
  revalidatePath("/")
}

/** Nova O.S. (3.4). O servidor revalida tudo e grava o retrato dos dados técnicos (RN-18). */
export async function criarOSAcao(rastreio: string, valores: OSFormValues): Promise<ResultadoOSAcao> {
  const parsed = osFormSchema.safeParse(valores)
  if (!parsed.success) return { ok: false, erro: "Revise os campos e tente de novo." }
  try {
    const { planilha, usuario } = await contextoDaSessao()
    const r = await criarOS(new PortaOSSheets(planilha), { usuario, agora: new Date().toISOString() }, rastreio, parsed.data)
    invalidarCacheOS(planilha.spreadsheetId)
    if (!r.ok) return { ok: false, erro: MSG[r.erro] }
    revalidar()
    return { ok: true, numero: r.os.numero, id: r.os.id }
  } catch (e) {
    console.error("[criarOSAcao]", e)
    return { ok: false, erro: e instanceof NaoAutenticadoError ? MSG_SESSAO : MSG_FALHA }
  }
}

/** Editar O.S. O retrato não é refeito (RN-09, RN-18). */
export async function editarOSAcao(id: string, valores: OSFormValues, versao: string): Promise<ResultadoOSAcao> {
  const parsed = osFormSchema.safeParse(valores)
  if (!parsed.success) return { ok: false, erro: "Revise os campos e tente de novo." }
  try {
    const { planilha, usuario } = await contextoDaSessao()
    const motores = new SheetsMotorRepository(planilha)
    invalidarCacheMotores(planilha.spreadsheetId)
    const r = await editarOS(
      new PortaOSSheets(planilha),
      { usuario, agora: new Date().toISOString() },
      id,
      parsed.data,
      versao,
      async (motorId) => (await motores.listar()).find((m) => m.id === motorId) ?? null,
    )
    invalidarCacheOS(planilha.spreadsheetId)
    if (!r.ok) return { ok: false, erro: MSG[r.erro], conflito: r.erro === "CONFLITO" }
    revalidar()
    return { ok: true, numero: parsed.data.numero.trim(), id }
  } catch (e) {
    console.error("[editarOSAcao]", e)
    return { ok: false, erro: e instanceof NaoAutenticadoError ? MSG_SESSAO : MSG_FALHA }
  }
}
