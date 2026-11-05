"use server"

import { revalidatePath } from "next/cache"
import { montarBobinagens, montarMotor } from "@/lib/motor-mapper"
import { motorFormSchema, type MotorFormValues } from "@/lib/motor-schema"
import { mensagemRastreioEmUso, validarRastreioDigitado } from "@/lib/rastreio"
import { contextoDaSessao, NaoAutenticadoError } from "../contexto"
import { criarMotor, rastreioOcupado } from "../rastreio-service"
import { invalidarCacheMotores } from "../repositories/sheets-motor-repository"
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
export async function cadastrarMotor(valores: MotorFormValues): Promise<ResultadoCadastro> {
  const parsed = motorFormSchema.safeParse(valores)
  if (!parsed.success) return { ok: false, erro: "Revise os campos e tente de novo." }
  const v = parsed.data

  try {
    const { planilha, usuario } = await contextoDaSessao()
    const ctx = { usuario, agora: new Date().toISOString() }
    const montar = (rastreio: string, origem: "AUTOMATICO" | "MANUAL") => {
      const motor = montarMotor(v, rastreio, origem, ctx)
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
