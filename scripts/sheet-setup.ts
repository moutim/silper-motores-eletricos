/** Acha ou cria a planilha da Silper no Drive da conta e garante abas e cabeçalhos. */
import { acharOuCriarPlanilha, NOME_PLANILHA } from "@/server/sheets/bootstrap"
import { clientesDev, salvarTokenLocal } from "./_dev"

const { sheets, drive, token } = await clientesDev()
const planilha = await acharOuCriarPlanilha(sheets, drive)
salvarTokenLocal({ ...token, spreadsheetId: planilha.spreadsheetId })
console.log(`Planilha "${NOME_PLANILHA}" pronta: https://docs.google.com/spreadsheets/d/${planilha.spreadsheetId}`)
