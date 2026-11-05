"use server"

import { revalidatePath } from "next/cache"
import { montarBobinagens, montarMotor } from "@/lib/motor-mapper"
import { motorFormSchema, type MotorFormValues } from "@/lib/motor-schema"
import { mensagemRastreioEmUso, validarRastreioDigitado } from "@/lib/rastreio"
import { contextoDaSessao, NaoAutenticadoError } from "../contexto"
import { criarMotor, rastreioOcupado } from "../rastreio-service"
import { invalidarCacheMotores, SheetsMotorRepository } from "../repositories/sheets-motor-repository"
import { alterarAtivo, editarMotor } from "../motor-service"
import { PortaDadosSheets } from "../sheets/porta-dados"
import { PortaMotoresSheets } from "../sheets/porta-motores"

export type ResultadoVerificacao =
  | { ok: true }
  | { ok: false; motivo: "INVALIDO" | "EM_USO" | "FALHA"; erro: string }
export type ResultadoCadastro =
  | { ok: true; rastreio: string }
  | { ok: false; campo?: "rastreio"; erro: string }

const MSG_SESSAO = "Sua sessão expirou. Entre de novo."
const MSG_FALHA = "Não foi possível salvar. Tente de novo."

/** Verificação ao sair do campo (RN-04). O servidor confere de novo ao salvar. */
export async function verificarRastreio(valor: string): Promise<ResultadoVerificacao> {
  const r = validarRastreioDigitado(valor)
  if (!r.ok) return { ok: false, motivo: "INVALIDO", erro: r.erro }
  try {
    const { planilha } = await contextoDaSessao()
    if (await rastreioOcupado(new PortaMotoresSheets(planilha), r.valor)) {
      return { ok: false, motivo: "EM_USO", erro: mensagemRastreioEmUso(r.valor) }
    }
    return { ok: true }
  } catch (e) {
    console.error("[verificarRastreio]", e)
    return {
      ok: false,
      motivo: "FALHA",
      erro: e instanceof NaoAutenticadoError ? MSG_SESSAO : "Não foi possível verificar. Tente de novo.",
    }
  }
}

/** O servidor é a autoridade: revalida tudo e gera/confere o rastreio dentro do serviço. */
export async function cadastrarMotor(
  valores: MotorFormValues,
  modeloOrigemId?: string | null,
): Promise<ResultadoCadastro> {
  const parsed = motorFormSchema.safeParse(valores)
  if (!parsed.success) return { ok: false, erro: "Revise os campos e tente de novo." }
  const v = parsed.data

  try {
    const { planilha, usuario } = await contextoDaSessao()
    const ctx = { usuario, agora: new Date().toISOString() }
    // Motor-base (RN-10): os dados já vieram copiados no formulário; aqui só se guarda o vínculo, e só se o motor existir.
    const modelo = modeloOrigemId
      ? ((await new SheetsMotorRepository(planilha).listar()).find((m) => m.id === modeloOrigemId)?.id ?? null)
      : null
    const montar = (rastreio: string, origem: "AUTOMATICO" | "MANUAL") => {
      const motor = { ...montarMotor(v, rastreio, origem, ctx), modeloOrigemId: modelo }
      return { motor, bobinagens: montarBobinagens(v, motor.id, ctx) }
    }
    const porta = new PortaMotoresSheets(planilha)
    const r =
      v.rastreioModo === "MANUAL"
        ? await criarMotor(porta, { modo: "MANUAL", digitado: v.rastreio, montar })
        : await criarMotor(porta, { modo: "AUTOMATICO", montar })

    invalidarCacheMotores(planilha.spreadsheetId)
    if (!r.ok) return { ok: false, campo: "rastreio", erro: mensagemRastreioEmUso(v.rastreio.trim()) }

    revalidatePath("/motores")
    revalidatePath("/")
    return { ok: true, rastreio: r.motor.rastreio }
  } catch (e) {
    console.error("[cadastrarMotor]", e)
    return { ok: false, erro: e instanceof NaoAutenticadoError ? MSG_SESSAO : MSG_FALHA }
  }
}

export type ResultadoEdicaoAcao = { ok: true } | { ok: false; erro: string; conflito?: boolean }

const MSG_EDICAO = {
  NAO_ENCONTRADO: "Motor não encontrado.",
  DESATIVADO: "Este motor está desativado. Reative para editar.",
  CONFLITO: "Este motor foi alterado por outra pessoa. Feche e abra a ficha de novo para ver as mudanças.",
} as const

/** Edita a ficha (3.8). O servidor revalida tudo e recusa se a ficha mudou desde que a tela abriu. */
export async function editarMotorAcao(
  rastreio: string,
  valores: MotorFormValues,
  versao: string,
): Promise<ResultadoEdicaoAcao> {
  const parsed = motorFormSchema.safeParse(valores)
  if (!parsed.success) return { ok: false, erro: "Revise os campos e tente de novo." }
  try {
    const { planilha, usuario } = await contextoDaSessao()
    const r = await editarMotor(
      new PortaDadosSheets(planilha),
      { usuario, agora: new Date().toISOString() },
      rastreio,
      parsed.data,
      versao,
    )
      invalidarCacheMotores(planilha.spreadsheetId)
    if (!r.ok) return { ok: false, erro: MSG_EDICAO[r.erro], conflito: r.erro === "CONFLITO" }
    revalidatePath("/motores")
    revalidatePath("/motores/[rastreio]", "page")
    revalidatePath("/")
    return { ok: true }
  } catch (e) {
    console.error("[editarMotorAcao]", e)
    return { ok: false, erro: e instanceof NaoAutenticadoError ? MSG_SESSAO : MSG_FALHA }
  }
}

/** Desativar (RN-17) ou reativar um motor. Nunca apaga. */
export async function alterarAtivoMotor(rastreio: string, ativo: boolean): Promise<ResultadoEdicaoAcao> {
  try {
    const { planilha, usuario } = await contextoDaSessao()
    const r = await alterarAtivo(new PortaDadosSheets(planilha), { usuario, agora: new Date().toISOString() }, rastreio, ativo)
    invalidarCacheMotores(planilha.spreadsheetId)
    if (!r.ok) return { ok: false, erro: MSG_EDICAO.NAO_ENCONTRADO }
    revalidatePath("/motores")
    revalidatePath("/motores/[rastreio]", "page")
    revalidatePath("/")
    return { ok: true }
  } catch (e) {
    console.error("[alterarAtivoMotor]", e)
    return { ok: false, erro: e instanceof NaoAutenticadoError ? MSG_SESSAO : "Não foi possível concluir. Tente de novo." }
  }
}
