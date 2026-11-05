import { z } from "zod"
import { config } from "./config"
import { validarRastreioDigitado } from "./rastreio"

/**
 * Valores do formulário de novo motor (tudo texto, como vem dos campos). A mesma validação roda no
 * navegador (feedback) e no servidor (autoridade). Doc 01, seção 6.
 */

const texto = (max: number) => z.string().trim().max(max, `Use até ${max} caracteres.`)

/** "0,5" e "0.5" valem; até 2 casas. */
export function parseDecimal(valor: string): number | null {
  const v = valor.trim()
  if (v === "") return null
  if (!/^\d+([.,]\d{1,2})?$/.test(v)) return Number.NaN
  return Number(v.replace(",", "."))
}

export const bobinaSchema = z.object({
  passo: texto(40),
  voltas: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) > 0), "Use um número inteiro maior que zero."),
  fio: texto(40),
  ligacao: z.enum(["", "SERIE", "PARALELO"]),
  camada: z.enum(["", "UNICA", "DUPLA"]),
})

export const motorFormSchema = z
  .object({
    rastreioModo: z.enum(["AUTOMATICO", "MANUAL"]),
    rastreio: z.string(),
    clienteNome: z
      .string()
      .trim()
      .min(config.campos.clienteMin, `Informe o cliente (${config.campos.clienteMin} a ${config.campos.clienteMax} letras).`)
      .max(config.campos.clienteMax, `Use até ${config.campos.clienteMax} caracteres.`),
    marca: texto(60),
    modelo: texto(60),
    tipoEquipamento: texto(80),
    potenciaValor: z.string().trim().refine((v) => {
      const n = parseDecimal(v)
      return n === null || (Number.isFinite(n) && n > 0)
    }, "Use um número maior que zero (exemplo 5 ou 0,5)."),
    potenciaUnidade: z.enum(["CV", "HP", "KW"]),
    tensao: texto(40),
    corrente: texto(40),
    rpm: texto(40),
    fatorServico: texto(40),
    item: texto(40),
    pacote: texto(40),
    diametro: texto(40),
    tipoMotor: z.enum(["MONOFASICO", "TRIFASICO"]),
    /** Trifásico usa só este grupo. Monofásico: bobina de trabalho. */
    trabalho: bobinaSchema,
    /** Só monofásico: bobina auxiliar (descartada ao salvar como trifásico). */
    auxiliar: bobinaSchema,
  })
  .superRefine((v, ctx) => {
    if (v.rastreioModo === "MANUAL") {
      const r = validarRastreioDigitado(v.rastreio)
      if (!r.ok) ctx.addIssue({ code: "custom", path: ["rastreio"], message: r.erro })
    }
  })

export type MotorFormValues = z.infer<typeof motorFormSchema>

const bobinaVazia = { passo: "", voltas: "", fio: "", ligacao: "", camada: "" } as const

export function valoresIniciais(): MotorFormValues {
  return {
    rastreioModo: "AUTOMATICO",
    rastreio: "",
    clienteNome: "",
    marca: "",
    modelo: "",
    tipoEquipamento: "",
    potenciaValor: "",
    potenciaUnidade: "CV",
    tensao: "",
    corrente: "",
    rpm: "",
    fatorServico: "",
    item: "",
    pacote: "",
    diametro: "",
    tipoMotor: "TRIFASICO",
    trabalho: { ...bobinaVazia },
    auxiliar: { ...bobinaVazia },
  }
}
