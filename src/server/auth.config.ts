import type { NextAuthConfig } from "next-auth"

const seguro = (process.env.AUTH_URL ?? "").startsWith("https://")
const prefixo = seguro ? "__Secure-" : ""

/**
 * Cookies com nome próprio: no localhost os cookies valem para todas as portas, e outro app com
 * Auth.js (por exemplo o financeiro-os) usaria o mesmo nome com outro segredo, derrubando a sessão.
 */
function cookie(nome: string, extras: object = {}) {
  return {
    name: `${prefixo}silper.${nome}`,
    options: { httpOnly: true, sameSite: "lax" as const, path: "/", secure: seguro, ...extras },
  }
}

/** Parte da configuração segura para o proxy (sem googleapis). Os provedores entram em auth.ts. */
export const authConfig = {
  pages: { signIn: "/login", error: "/login" },
  providers: [],
  cookies: {
    sessionToken: cookie("session-token"),
    callbackUrl: cookie("callback-url"),
    csrfToken: cookie("csrf-token"),
    pkceCodeVerifier: cookie("pkce-code-verifier", { maxAge: 900 }),
    state: cookie("state", { maxAge: 900 }),
    nonce: cookie("nonce"),
  },
} satisfies NextAuthConfig
