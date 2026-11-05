import { auth } from "./auth"
import { clientesGoogle, Planilha } from "./sheets/client"

export class NaoAutenticadoError extends Error {
  constructor() {
    super("NAO_AUTENTICADO")
  }
}

/** Planilha da conta logada e o e-mail dela (para auditoria). Lança se não houver sessão válida. */
export async function contextoDaSessao() {
  const sessao = await auth()
  if (!sessao?.accessToken || !sessao.spreadsheetId || sessao.error) throw new NaoAutenticadoError()
  const { sheets } = clientesGoogle(sessao.accessToken)
  return {
    planilha: new Planilha(sheets, sessao.spreadsheetId),
    usuario: sessao.user?.email ?? "desconhecido",
  }
}
