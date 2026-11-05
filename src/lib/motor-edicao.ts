import { bobinaDoFormulario, montarMotor } from "./motor-mapper"
import { type MotorFormValues, valoresIniciais } from "./motor-schema"
import type { Bobinagem, FuncaoBobina, Motor } from "./types"

interface Contexto {
  usuario: string
  agora: string
  novoId?: () => string
}

/**
 * Aplica a edição da ficha ao motor. Rastreio, origem, criação e vínculo de modelo nunca mudam
 * (RN-02, RN-09); só os dados técnicos e a auditoria de alteração.
 */
export function atualizarMotor(atual: Motor, v: MotorFormValues, ctx: Contexto): Motor {
  const novo = montarMotor(v, atual.rastreio, atual.rastreioOrigem, ctx)
  return {
    ...novo,
    id: atual.id,
    rastreioChave: atual.rastreioChave,
    ativo: atual.ativo,
    modeloOrigemId: atual.modeloOrigemId,
    criadoEm: atual.criadoEm,
    criadoPor: atual.criadoPor,
  }
}

export interface PlanoBobinagens {
  atualizar: { linha: number; bobinagem: Bobinagem }[]
  criar: Bobinagem[]
  /** Linhas a esvaziar (descartadas). */
  descartar: number[]
}

/**
 * Decide o que fazer com as bobinagens ao salvar a edição (RN-12):
 * - trifásico -> monofásico: a bobinagem única vira "trabalho" e a "auxiliar" é criada;
 * - monofásico -> trifásico: a de "trabalho" vira "única" e a "auxiliar" é descartada.
 * A combinação (motor, função) nunca se repete.
 */
export function planejarBobinagens(
  existentes: { linha: number; bobinagem: Bobinagem }[],
  v: MotorFormValues,
  motorId: string,
  ctx: Contexto,
): PlanoBobinagens {
  const porFuncao = (f: FuncaoBobina) => existentes.find((e) => e.bobinagem.funcao === f)
  const alvos: { funcao: FuncaoBobina; grupo: MotorFormValues["trabalho"]; origem: FuncaoBobina[] }[] =
    v.tipoMotor === "MONOFASICO"
      ? [
          { funcao: "TRABALHO", grupo: v.trabalho, origem: ["TRABALHO", "UNICA"] },
          { funcao: "AUXILIAR", grupo: v.auxiliar, origem: ["AUXILIAR"] },
        ]
      : [{ funcao: "UNICA", grupo: v.trabalho, origem: ["UNICA", "TRABALHO"] }]

  const plano: PlanoBobinagens = { atualizar: [], criar: [], descartar: [] }
  const usadas = new Set<number>()

  for (const alvo of alvos) {
    const linhaExistente = alvo.origem.map(porFuncao).find((e) => e && !usadas.has(e.linha))
    if (linhaExistente) {
      usadas.add(linhaExistente.linha)
      plano.atualizar.push({
        linha: linhaExistente.linha,
        bobinagem: bobinaDoFormulario(alvo.grupo, alvo.funcao, motorId, ctx, linhaExistente.bobinagem),
      })
    } else {
      plano.criar.push(bobinaDoFormulario(alvo.grupo, alvo.funcao, motorId, ctx))
    }
  }
  plano.descartar = existentes.filter((e) => !usadas.has(e.linha)).map((e) => e.linha)
  return plano
}

const comVirgula = (n: number) => String(n).replace(".", ",")

/** Valores iniciais do formulário de edição, a partir do que está salvo. */
export function formularioDoMotor(motor: Motor, bobinagens: Bobinagem[]): MotorFormValues {
  const base = valoresIniciais()
  const grupo = (b: Bobinagem | undefined): MotorFormValues["trabalho"] =>
    b
      ? {
          passo: b.passo ?? "",
          voltas: b.voltas === null ? "" : String(b.voltas),
          fio: b.fio ?? "",
          ligacao: b.ligacao ?? "",
          camada: b.camada ?? "",
        }
      : base.trabalho
  const principal =
    bobinagens.find((b) => b.funcao === "UNICA") ?? bobinagens.find((b) => b.funcao === "TRABALHO")
  return {
    ...base,
    rastreioModo: "AUTOMATICO",
    rastreio: motor.rastreio,
    clienteNome: motor.clienteNome,
    marca: motor.marca ?? "",
    modelo: motor.modelo ?? "",
    tipoEquipamento: motor.tipoEquipamento ?? "",
    potenciaValor: motor.potenciaValor === null ? "" : comVirgula(motor.potenciaValor),
    potenciaUnidade: motor.potenciaUnidade ?? "CV",
    tensao: motor.tensao ?? "",
    corrente: motor.corrente ?? "",
    rpm: motor.rpm ?? "",
    fatorServico: motor.fatorServico ?? "",
    item: motor.item ?? "",
    pacote: motor.pacote ?? "",
    diametro: motor.diametro ?? "",
    tipoMotor: motor.tipoMotor,
    trabalho: grupo(principal),
    auxiliar: grupo(bobinagens.find((b) => b.funcao === "AUXILIAR")),
  }
}
