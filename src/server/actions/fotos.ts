"use server"

import { revalidatePath } from "next/cache"
import { MENSAGEM_ERRO_FOTO } from "@/lib/foto"
import { auth } from "../auth"
import { contextoDaSessao, NaoAutenticadoError } from "../contexto"
import { excluirFoto } from "../foto-service"
import { clientesGoogle } from "../sheets/client"
import { PortaFotosSheets } from "../sheets/porta-fotos"
import { ArmazenamentoDrive } from "../storage/drive"

export type ResultadoFotoAcao = { ok: true } | { ok: false; erro: string }

/** Exclui a foto: o arquivo vai para a lixeira do Drive e a foto sai da lista. */
export async function excluirFotoAcao(id: string): Promise<ResultadoFotoAcao> {
  try {
    const { planilha } = await contextoDaSessao()
    const sessao = await auth()
    const { drive } = clientesGoogle(sessao!.accessToken)
    const r = await excluirFoto(new PortaFotosSheets(planilha), new ArmazenamentoDrive(drive, planilha.spreadsheetId), id)
    if (!r.ok) return { ok: false, erro: MENSAGEM_ERRO_FOTO[r.erro] }
    revalidatePath("/motores/[rastreio]", "page")
    revalidatePath("/os/[id]", "page")
    return { ok: true }
  } catch (e) {
    console.error("[excluirFotoAcao]", e)
    return {
      ok: false,
      erro: e instanceof NaoAutenticadoError ? "Sua sessão expirou. Entre de novo." : "Não foi possível excluir. Tente de novo.",
    }
  }
}
