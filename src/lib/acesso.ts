/**
 * Quem pode entrar (PENDENTE, doc 01 seção 7): lista de e-mails em AUTH_ALLOWED_EMAILS,
 * separados por vírgula. Lista vazia = qualquer conta Google (cada conta usa a própria planilha).
 */
export function listaDeEmailsPermitidos(env: string | undefined): string[] {
  return (env ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function emailPermitido(email: string | null | undefined, env: string | undefined): boolean {
  const lista = listaDeEmailsPermitidos(env)
  if (lista.length === 0) return true
  return !!email && lista.includes(email.trim().toLowerCase())
}

/** Aceita só caminho interno ("/motores/x"); qualquer outra coisa vira "/" (evita redirecionamento aberto). */
export function destinoSeguro(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/"
  if (next.startsWith("/login") || next.startsWith("/api/auth")) return "/"
  return next
}
