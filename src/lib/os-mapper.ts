import { montarRetrato } from "./retrato"
import { parseMoeda } from "./moeda"
import { moedaParaCampo } from "./moeda"
import type { OSFormValues } from "./os-schema"
import type { Bobinagem, Motor, OrdemServico } from "./types"

interface Contexto {
  usuario: string
  agora: string
  novoId?: () => string
}

const nul = (s: string): string | null => (s.trim() === "" ? null : s.trim())
const valor = (s: string): number | null => {
  const n = parseMoeda(s)
  return n === null || Number.isNaN(n) ? null : n
}

/** Abre uma O.S.: grava o retrato dos dados técnicos nesse momento (RN-18). */
export function montarOS(v: OSFormValues, motor: Motor, bobinagens: Bobinagem[], ctx: Contexto): OrdemServico {
  return {
    id: (ctx.novoId ?? crypto.randomUUID.bind(crypto))(),
    motorId: motor.id,
    numero: v.numero.trim(),
    dataEntrada: v.dataEntrada,
    defeito: nul(v.defeito),
    servicoExecutado: nul(v.servicoExecutado),
    observacoes: nul(v.observacoes),
    valorNota: valor(v.valorNota),
    retratoTecnico: montarRetrato(motor, bobinagens),
    criadoEm: ctx.agora,
    atualizadoEm: ctx.agora,
    criadoPor: ctx.usuario,
    atualizadoPor: ctx.usuario,
  }
}

/** Edita a O.S. O retrato, o motor e a criação nunca mudam (RN-09, RN-18). */
export function atualizarOS(atual: OrdemServico, v: OSFormValues, ctx: Contexto): OrdemServico {
  return {
    ...atual,
    numero: v.numero.trim(),
    dataEntrada: v.dataEntrada,
    defeito: nul(v.defeito),
    servicoExecutado: nul(v.servicoExecutado),
    observacoes: nul(v.observacoes),
    valorNota: valor(v.valorNota),
    atualizadoEm: ctx.agora,
    atualizadoPor: ctx.usuario,
  }
}

export function formularioDaOS(os: OrdemServico): OSFormValues {
  return {
    numero: os.numero,
    dataEntrada: os.dataEntrada,
    defeito: os.defeito ?? "",
    servicoExecutado: os.servicoExecutado ?? "",
    observacoes: os.observacoes ?? "",
    valorNota: os.valorNota === null ? "" : moedaParaCampo(os.valorNota),
  }
}
