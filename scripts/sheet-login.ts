/**
 * Login local de desenvolvimento: abre o consentimento do Google e guarda o refresh token em
 * .sheet-token.json (ignorado pelo git). Usa o mesmo redirect do Auth.js
 * (http://localhost:3000/api/auth/callback/google), então pare o `npm run dev` antes.
 */
import { createServer } from "node:http"
import { exec } from "node:child_process"
import { google } from "googleapis"
import { salvarTokenLocal } from "./_dev"

const redirect = "http://localhost:3000/api/auth/callback/google"
const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, redirect)
const url = auth.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["openid", "email", "profile", "https://www.googleapis.com/auth/drive.file"],
})

const server = createServer(async (req, res) => {
  const u = new URL(req.url ?? "/", "http://localhost:3000")
  if (u.pathname !== "/api/auth/callback/google") {
    res.writeHead(404).end()
    return
  }
  try {
    const code = u.searchParams.get("code")
    if (!code) throw new Error(u.searchParams.get("error") ?? "sem código")
    const { tokens } = await auth.getToken(code)
    if (!tokens.refresh_token) throw new Error("O Google não devolveu refresh token.")
    auth.setCredentials(tokens)
    const info = await google.oauth2({ version: "v2", auth }).userinfo.get()
    salvarTokenLocal({ refreshToken: tokens.refresh_token, email: info.data.email ?? undefined })
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" })
    res.end("<h3>Login feito. Pode fechar esta aba e voltar ao terminal.</h3>")
    console.log(`Login salvo para ${info.data.email}.`)
  } catch (e) {
    res.writeHead(500).end("Falha no login.")
    console.error("Falha no login:", (e as Error).message)
    process.exitCode = 1
  } finally {
    server.close()
  }
})

server.listen(3000, () => {
  console.log("Abra no navegador (tentando abrir sozinho):\n" + url)
  exec(`open "${url}"`)
})
