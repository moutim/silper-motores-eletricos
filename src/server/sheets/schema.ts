import type { AcessoRecente, Auditoria, Bobinagem, Foto, Motor, OrdemServico, SequenciaRastreio } from "@/lib/types"
import type { Col, TableDef } from "./codec"

const s = <T>(key: keyof T & string): Col<T> => ({ key, kind: "s" })
const n = <T>(key: keyof T & string): Col<T> => ({ key, kind: "n" })
const b = <T>(key: keyof T & string): Col<T> => ({ key, kind: "b" })
const j = <T>(key: keyof T & string): Col<T> => ({ key, kind: "j" })

function auditoria<T extends Auditoria>(): Col<T>[] {
  return [s<T>("criadoEm"), s<T>("atualizadoEm"), s<T>("criadoPor"), s<T>("atualizadoPor")]
}

/** Nomes das abas. Nunca renomear em produção. A ordem das colunas é a ordem destes arrays. */
export const MOTORES: TableDef<Motor> = {
  tab: "Motores",
  cols: [
    s("id"), s("rastreio"), s("rastreioChave"), s("rastreioOrigem"), s("clienteNome"),
    s("marca"), s("modelo"), s("tipoEquipamento"), n("potenciaValor"), s("potenciaUnidade"),
    s("tensao"), s("corrente"), s("rpm"), s("fatorServico"), s("item"), s("pacote"), s("diametro"),
    s("tipoMotor"), b("ativo"), s("modeloOrigemId"), ...auditoria<Motor>(),
  ],
}

export const BOBINAGENS: TableDef<Bobinagem> = {
  tab: "Bobinagens",
  cols: [
    s("id"), s("motorId"), s("funcao"), s("passo"), n("voltas"), s("fio"), s("ligacao"), s("camada"),
    ...auditoria<Bobinagem>(),
  ],
}

export const ORDENS_SERVICO: TableDef<OrdemServico> = {
  tab: "OrdensServico",
  cols: [
    s("id"), s("motorId"), s("numero"), s("dataEntrada"), s("defeito"), s("servicoExecutado"),
    s("observacoes"), n("valorNota"), j("retratoTecnico"), ...auditoria<OrdemServico>(),
  ],
}

export const FOTOS: TableDef<Foto> = {
  tab: "Fotos",
  cols: [
    s("id"), s("motorId"), s("osId"), s("tipo"), s("chaveArmazenamento"), s("mime"),
    n("tamanhoBytes"), n("largura"), n("altura"), ...auditoria<Foto>(),
  ],
}

export const ACESSOS_RECENTES: TableDef<AcessoRecente> = {
  tab: "AcessosRecentes",
  cols: [s("usuario"), s("motorId"), s("acessadoEm")],
}

export const SEQUENCIA_RASTREIO: TableDef<SequenciaRastreio> = {
  tab: "SequenciaRastreio",
  cols: [s("prefixo"), n("ultimoNumero")],
}

export const TABELAS = [
  MOTORES, BOBINAGENS, ORDENS_SERVICO, FOTOS, ACESSOS_RECENTES, SEQUENCIA_RASTREIO,
] as const
