import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { google } from "googleapis"
import { clientesGoogle } from "@/server/sheets/client"

export const ARQUIVO_TOKEN = ".sheet-token.json"

export interface TokenLocal {
  refreshToken: string
  email?: string
  spreadsheetId?: string
}

export function lerTokenLocal(): TokenLocal {
  if (!existsSync(ARQUIVO_TOKEN)) {
    console.error("Sem login. Rode primeiro: npm run sheet:login")
    process.exit(1)
  }
  return JSON.parse(readFileSync(ARQUIVO_TOKEN, "utf8"))
}

export function salvarTokenLocal(t: TokenLocal) {
  writeFileSync(ARQUIVO_TOKEN, JSON.stringify(t, null, 2), { mode: 0o600 })
}

/** Clientes Google com o refresh token salvo (a lib renova o access token sozinha). */
export async function clientesDev() {
  const t = lerTokenLocal()
  const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
  auth.setCredentials({ refresh_token: t.refreshToken })
  const { token } = await auth.getAccessToken()
  return { ...clientesGoogle(token!, t.refreshToken), token: t }
}
