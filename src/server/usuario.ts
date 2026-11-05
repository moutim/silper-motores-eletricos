import { cache } from "react"
import { auth } from "./auth"

export interface Usuario {
  nome: string
  email: string
  foto: string | null
}

/** Conta Google da sessão (nome, e-mail e foto). Uma leitura por requisição. */
export const usuarioAtual = cache(async (): Promise<Usuario | null> => {
  const sessao = await auth()
  const u = sessao?.user
  if (!u) return null
  return { nome: u.name ?? u.email ?? "Conta", email: u.email ?? "", foto: u.image ?? null }
})
