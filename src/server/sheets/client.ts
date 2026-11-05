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

/** 0 -> "A", 25 -> "Z", 26 -> "AA". */
export function letraDaColuna(indice: number): string {
  let n = indice
  let s = ""
  do {
    s = String.fromCharCode(65 + (n % 26)) + s
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return s
}

/**
 * Acesso tabular a uma planilha. Leituras usam UNFORMATTED_VALUE: a planilha da conta pode estar em
 * pt-BR e devolveria "1234,5" (texto) para o número 1234.5, o que quebraria a conversão. Lê com
 * A2:ZZ (sem o cabeçalho) e grava sempre em RAW.
 */
export class Planilha {
  constructor(
    private readonly sheets: Sheets,
    readonly spreadsheetId: string,
  ) {}

  async ler<T extends object>(def: TableDef<T>): Promise<T[]> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${def.tab}!A2:ZZ`,
      valueRenderOption: "UNFORMATTED_VALUE",
    })
    return (res.data.values ?? []).filter((r) => r.some((c) => c !== "")).map((r) => fromRow(def, r))
  }

  /** Como `ler`, mas devolve também a linha (1-based) de cada registro. Linhas vazias não contam, mas ocupam posição. */
  async lerLinhas<T extends object>(def: TableDef<T>): Promise<{ linha: number; obj: T }[]> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${def.tab}!A2:ZZ`,
      valueRenderOption: "UNFORMATTED_VALUE",
    })
    return (res.data.values ?? [])
      .map((r, i) => ({ r, linha: i + 2 }))
      .filter(({ r }) => r.some((c) => c !== ""))
      .map(({ r, linha }) => ({ linha, obj: fromRow(def, r) }))
  }

  /** Sobrescreve a linha inteira (`linha` é 1-based). */
  async atualizarLinha<T extends object>(def: TableDef<T>, linha: number, obj: T): Promise<void> {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${def.tab}!A${linha}`,
      valueInputOption: "RAW",
      requestBody: { values: [toRow(def, obj)] as Cell[][] },
    })
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

  /** Valores de uma coluna (sem o cabeçalho), na ordem das linhas: o índice i é a linha i + 2. Vazios viram "". */
  async lerColuna<T extends object>(def: TableDef<T>, key: keyof T & string): Promise<string[]> {
    const letra = letraDaColuna(def.cols.findIndex((c) => c.key === key))
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${def.tab}!${letra}2:${letra}`,
      valueRenderOption: "UNFORMATTED_VALUE",
    })
    return (res.data.values ?? []).map((r) => (r[0] === undefined || r[0] === null ? "" : String(r[0])))
  }

  /** Esvazia uma linha inteira (sem deslocar as outras). `linha` é 1-based. */
  async limparLinha(def: TableDef<never>, linha: number): Promise<void> {
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId: this.spreadsheetId,
      range: `${def.tab}!A${linha}:ZZ${linha}`,
    })
  }

  async atualizarCelula<T extends object>(
    def: TableDef<T>,
    key: keyof T & string,
    linha: number,
    valor: Cell,
  ): Promise<void> {
    const letra = letraDaColuna(def.cols.findIndex((c) => c.key === key))
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${def.tab}!${letra}${linha}`,
      valueInputOption: "RAW",
      requestBody: { values: [[valor]] },
    })
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
