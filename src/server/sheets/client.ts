import { google } from "googleapis"
import type { Cell, TableDef } from "./codec"
import { fromRow, headersOf, toRow } from "./codec"

/** Cliente OAuth com o token da conta da Silper (mesmo modelo do financeiro-os). */
export function clientesGoogle(accessToken: string, refreshToken?: string) {
  const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
  auth.setCredentials({ access_token: accessToken, refresh_token: refreshToken })
  return {
    sheets: google.sheets({ version: "v4", auth }),
    drive: google.drive({ version: "v3", auth }),
  }
}

export type Sheets = ReturnType<typeof clientesGoogle>["sheets"]

/** Acesso tabular a uma planilha. Lê com A2:ZZ (sem o cabeçalho) e grava sempre em RAW. */
export class Planilha {
  constructor(
    private readonly sheets: Sheets,
    readonly spreadsheetId: string,
  ) {}

  async ler<T extends object>(def: TableDef<T>): Promise<T[]> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${def.tab}!A2:ZZ`,
    })
    return (res.data.values ?? []).filter((r) => r.some((c) => c !== "")).map((r) => fromRow(def, r))
  }

  /** Acrescenta linhas ao fim. Retorna a linha (1-based) da primeira linha gravada. */
  async acrescentar<T extends object>(def: TableDef<T>, objs: T[]): Promise<number> {
    if (objs.length === 0) return 0
    const res = await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: `${def.tab}!A1`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: objs.map((o) => toRow(def, o)) as Cell[][] },
    })
    const alvo = res.data.updates?.updatedRange ?? ""
    const m = /!A(\d+)/.exec(alvo)
    return m ? Number(m[1]) : 0
  }

  async escreverCabecalhos(defs: readonly TableDef<never>[]): Promise<void> {
    await this.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        valueInputOption: "RAW",
        data: defs.map((d) => ({ range: `${d.tab}!A1`, values: [headersOf(d)] })),
      },
    })
  }

  /** Apaga todas as linhas de dados (mantém o cabeçalho). */
  async limpar(defs: readonly TableDef<never>[]): Promise<void> {
    await this.sheets.spreadsheets.values.batchClear({
      spreadsheetId: this.spreadsheetId,
      requestBody: { ranges: defs.map((d) => `${d.tab}!A2:ZZ`) },
    })
  }
}
