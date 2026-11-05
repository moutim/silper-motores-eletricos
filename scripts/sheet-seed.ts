/** Apaga os dados da planilha e grava os dados de exemplo do protótipo. DESTRUTIVO: só para dev. */
import { Planilha } from "@/server/sheets/client"
import { ACESSOS_RECENTES, BOBINAGENS, MOTORES, ORDENS_SERVICO, SEQUENCIA_RASTREIO, TABELAS } from "@/server/sheets/schema"
import { clientesDev } from "./_dev"
import { gerarSeed } from "./seed-data"

const { sheets, token } = await clientesDev()
if (!token.spreadsheetId) {
  console.error("Sem planilha. Rode primeiro: npm run sheet:setup")
  process.exit(1)
}
const planilha = new Planilha(sheets, token.spreadsheetId)
const dados = gerarSeed(token.email ?? "seed")

await planilha.limpar(TABELAS as unknown as never[])
await planilha.acrescentar(MOTORES, dados.motores)
await planilha.acrescentar(BOBINAGENS, dados.bobinagens)
await planilha.acrescentar(ORDENS_SERVICO, dados.ordens)
await planilha.acrescentar(SEQUENCIA_RASTREIO, dados.sequencia)
await planilha.acrescentar(ACESSOS_RECENTES, dados.acessos)
console.log(
  `Seed gravado: ${dados.motores.length} motores, ${dados.bobinagens.length} bobinagens, ${dados.ordens.length} O.S.`,
)
