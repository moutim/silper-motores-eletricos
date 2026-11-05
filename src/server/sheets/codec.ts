/** Conversão entre objetos de domínio e linhas da planilha. Tudo é gravado com valueInputOption RAW. */

export type Kind = "s" | "n" | "b" | "j"
export interface Col<T> {
  key: keyof T & string
  kind: Kind
}
export interface TableDef<T> {
  tab: string
  cols: readonly Col<T>[]
}

export type Cell = string | number | boolean

export function headersOf<T>(def: TableDef<T>): string[] {
  return def.cols.map((c) => c.key)
}

export function toRow<T extends object>(def: TableDef<T>, obj: T): Cell[] {
  return def.cols.map(({ key, kind }) => {
    const v = (obj as Record<string, unknown>)[key]
    if (v === null || v === undefined) return ""
    if (kind === "j") return JSON.stringify(v)
    if (kind === "b") return v ? "TRUE" : "FALSE"
    if (kind === "n") return Number(v)
    return String(v)
  })
}

export function fromRow<T extends object>(def: TableDef<T>, row: unknown[]): T {
  const out: Record<string, unknown> = {}
  def.cols.forEach(({ key, kind }, i) => {
    const raw = row[i]
    const vazio = raw === undefined || raw === null || raw === ""
    if (kind === "b") out[key] = String(raw).toUpperCase() === "TRUE"
    else if (vazio) out[key] = null
    else if (kind === "n") out[key] = Number(raw)
    else if (kind === "j") out[key] = JSON.parse(String(raw))
    else out[key] = String(raw)
  })
  return out as T
}
