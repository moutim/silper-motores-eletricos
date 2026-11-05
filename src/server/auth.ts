import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { emailPermitido } from "@/lib/acesso"
import { authConfig } from "./auth.config"
import { acharOuCriarPlanilha } from "./sheets/bootstrap"
import { clientesGoogle } from "./sheets/client"

/** Traduz a falha da preparação da planilha em um código que a tela de login entende. */
function classificarErro(err: unknown, escopo?: string): string {
  if (escopo !== undefined && !escopo.includes("drive.file")) return "drive_permission"
  const e = err as {
    code?: number | string
    status?: number
    response?: { status?: number; data?: { error?: { errors?: { reason?: string }[] } } }
  }
  const status = Number(e?.response?.status ?? e?.status ?? e?.code)
  const motivos = (e?.response?.data?.error?.errors ?? []).map((r) => r.reason)
  if (motivos.includes("storageQuotaExceeded")) return "drive_quota"
  if (status === 401 || status === 403) return "drive_permission"
  return "setup_failed"
}

async function renovarToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error("RefreshAccessTokenError")
  return {
    accessToken: data.access_token as string,
    accessTokenExpires: Date.now() + (data.expires_in as number) * 1000,
    refreshToken: (data.refresh_token as string | undefined) ?? refreshToken,
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: ["openid", "email", "profile", "https://www.googleapis.com/auth/drive.file"].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    // Valida a conta e prepara a planilha antes de criar a sessão: assim dá para voltar ao /login com o motivo.
    async signIn({ account, profile }) {
      if (!emailPermitido(profile?.email, process.env.AUTH_ALLOWED_EMAILS)) return "/login?error=sem_acesso"
      if (!account?.access_token) return true
      if (!account.scope?.includes("drive.file")) return "/login?error=drive_permission"
      try {
        const { sheets, drive } = clientesGoogle(account.access_token, account.refresh_token)
        const planilha = await acharOuCriarPlanilha(sheets, drive)
        account.spreadsheetId = planilha.spreadsheetId
        return true
      } catch (err) {
        console.error("[auth] Falha ao preparar a planilha:", err)
        return `/login?error=${classificarErro(err, account.scope)}`
      }
    },

    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: Date.now() + (account.expires_in as number) * 1000,
          spreadsheetId: account.spreadsheetId,
        }
      }
      if (Date.now() < (token.accessTokenExpires as number)) return token
      try {
        return { ...token, ...(await renovarToken(token.refreshToken as string)) }
      } catch {
        return { ...token, error: "RefreshAccessTokenError" }
      }
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.spreadsheetId = token.spreadsheetId as string
      session.error = token.error as string | undefined
      return session
    },
  },
})
