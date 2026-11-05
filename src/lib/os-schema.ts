import { z } from "zod"
import { config } from "./config"
import { hojeSaoPaulo } from "./format"
import { parseMoeda } from "./moeda"

/** Valores do formulário da O.S. (tudo texto). Doc 01, seções 4.4 e 6. A mesma validação roda no navegador e no servidor. */

const dataValida = (v: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const d = new Date(`${v}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v
}

export const osFormSchema = z
  .object({
    /** Digitado pelo usuário. Sem checagem de duplicidade (RN-07, RN-08). */
    numero: z
      .string()
      .trim()
      .min(1, "Informe o número da O.S.")
      .max(config.campos.osNumeroMax, `Use até ${config.campos.osNumeroMax} caracteres.`),
    dataEntrada: z.string().refine(dataValida, "Informe uma data válida."),
    defeito: z.string().trim().max(2000, "Use até 2000 caracteres."),
    servicoExecutado: z.string().trim().max(2000, "Use até 2000 caracteres."),
    observacoes: z.string().trim().max(4000, "Use até 4000 caracteres."),
    valorNota: z.string().trim().refine((v) => {
      const n = parseMoeda(v)
      return n === null || (Number.isFinite(n) && n >= 0)
    }, "Use um valor em reais, maior ou igual a zero (exemplo 1.234,56)."),
  })
  .superRefine((v, ctx) => {
    if (dataValida(v.dataEntrada) && !config.campos.dataEntradaPodeSerFutura && v.dataEntrada > hojeSaoPaulo()) {
      ctx.addIssue({ code: "custom", path: ["dataEntrada"], message: "A data de entrada não pode estar no futuro." })
    }
  })

export type OSFormValues = z.infer<typeof osFormSchema>

export function osValoresIniciais(): OSFormValues {
  return {
    numero: "",
    dataEntrada: hojeSaoPaulo(),
    defeito: "",
    servicoExecutado: "",
    observacoes: "",
    valorNota: "",
  }
}
