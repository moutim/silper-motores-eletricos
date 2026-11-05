import { parseDecimal, type MotorFormValues } from "./motor-schema"
import { normalizarRastreio } from "./rastreio"
import type { Bobinagem, Camada, Ligacao, Motor, RastreioOrigem } from "./types"

interface Contexto {
  usuario: string
  agora: string
  novoId?: () => string
}

const nul = (s: string): string | null => (s.trim() === "" ? null : s.trim())

/** Monta o `Motor` a partir do formulário já validado. O rastreio vem do serviço (servidor). */
export function montarMotor(
  v: MotorFormValues,
  rastreio: string,
  origem: RastreioOrigem,
  ctx: Contexto,
): Motor {
  const potencia = parseDecimal(v.potenciaValor)
  return {
    id: (ctx.novoId ?? crypto.randomUUID.bind(crypto))(),
    rastreio,
    rastreioChave: normalizarRastreio(rastreio),
    rastreioOrigem: origem,
    clienteNome: v.clienteNome.trim(),
    marca: nul(v.marca),
    modelo: nul(v.modelo),
    tipoEquipamento: nul(v.tipoEquipamento),
    potenciaValor: potencia,
    potenciaUnidade: potencia === null ? null : v.potenciaUnidade,
    tensao: nul(v.tensao),
    corrente: nul(v.corrente),
    rpm: nul(v.rpm),
    fatorServico: nul(v.fatorServico),
    item: nul(v.item),
    pacote: nul(v.pacote),
    diametro: nul(v.diametro),
    tipoMotor: v.tipoMotor,
    ativo: true,
    modeloOrigemId: null,
    criadoEm: ctx.agora,
    atualizadoEm: ctx.agora,
    criadoPor: ctx.usuario,
    atualizadoPor: ctx.usuario,
  }
}

export type GrupoBobina = MotorFormValues["trabalho"]

/** Converte um grupo do formulário em `Bobinagem`. */
export function bobinaDoFormulario(
  g: GrupoBobina,
  funcao: Bobinagem["funcao"],
  motorId: string,
  ctx: Contexto,
  base?: Pick<Bobinagem, "id" | "criadoEm" | "criadoPor">,
): Bobinagem {
  return {
    id: base?.id ?? (ctx.novoId ?? crypto.randomUUID.bind(crypto))(),
    motorId,
    funcao,
    passo: nul(g.passo),
    voltas: g.voltas.trim() === "" ? null : Number(g.voltas),
    fio: nul(g.fio),
    ligacao: (g.ligacao || null) as Ligacao | null,
    camada: (g.camada || null) as Camada | null,
    criadoEm: base?.criadoEm ?? ctx.agora,
    criadoPor: base?.criadoPor ?? ctx.usuario,
    atualizadoEm: ctx.agora,
    atualizadoPor: ctx.usuario,
  }
}

/** RN-12: trifásico grava uma bobinagem (UNICA); monofásico grava duas (TRABALHO e AUXILIAR). */
export function montarBobinagens(v: MotorFormValues, motorId: string, ctx: Contexto): Bobinagem[] {
  return v.tipoMotor === "MONOFASICO"
    ? [bobinaDoFormulario(v.trabalho, "TRABALHO", motorId, ctx), bobinaDoFormulario(v.auxiliar, "AUXILIAR", motorId, ctx)]
    : [bobinaDoFormulario(v.trabalho, "UNICA", motorId, ctx)]
}
