import type { Sheets } from "./client"
import { Planilha } from "./client"
import { TABELAS } from "./schema"

export const NOME_PLANILHA = process.env.SHEET_NAME ?? "SilperMotores"

type Drive = ReturnType<typeof import("./client").clientesGoogle>["drive"]

/**
 * Acha (ou cria) a planilha da Silper no Drive da conta e garante abas e cabeçalhos.
 * Só enxerga arquivos criados por este app (escopo drive.file), igual ao financeiro-os.
 */
export async function acharOuCriarPlanilha(sheets: Sheets, drive: Drive): Promise<Planilha> {
  const busca = await drive.files.list({
    q: `name = '${NOME_PLANILHA}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false and 'me' in owners`,
    fields: "files(id)",
    spaces: "drive",
  })
  let id = busca.data.files?.[0]?.id ?? null
  const novas = TABELAS.map((t) => t.tab)

  if (!id) {
    const criada = await drive.files.create({
      requestBody: { name: NOME_PLANILHA, mimeType: "application/vnd.google-apps.spreadsheet" },
      fields: "id",
    })
    id = criada.data.id!
  }

  const meta = await sheets.spreadsheets.get({ spreadsheetId: id })
  const existentes = new Map(
    (meta.data.sheets ?? []).map((s) => [s.properties?.title ?? "", s.properties?.sheetId ?? 0]),
  )
  const requests = novas.filter((t) => !existentes.has(t)).map((title) => ({ addSheet: { properties: { title } } }))
  if (requests.length) await sheets.spreadsheets.batchUpdate({ spreadsheetId: id, requestBody: { requests } })

  // Remove a aba padrão vazia de uma planilha recém-criada.
  const padrao = ["Sheet1", "Página1", "Planilha1"].find((t) => existentes.has(t) && !novas.includes(t))
  if (padrao) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: id,
      requestBody: { requests: [{ deleteSheet: { sheetId: existentes.get(padrao)! } }] },
    })
  }

  const planilha = new Planilha(sheets, id)
  await planilha.escreverCabecalhos(TABELAS as unknown as never[])
  return planilha
}
