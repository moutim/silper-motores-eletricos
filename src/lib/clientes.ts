import { semAcento } from "./format"
import type { Motor } from "./types"

/**
 * Nomes de cliente já cadastrados, sem repetição, em ordem alfabética. Não há cadastro de cliente
 * à parte: a lista vem dos motores ativos. Maiúsculas, acentos e espaços repetidos não separam
 * clientes; vale a grafia do primeiro motor encontrado.
 */
export function clientesCadastrados(motores: Pick<Motor, "clienteNome" | "ativo">[]): string[] {
  const vistos = new Map<string, string>()
  for (const m of motores) {
    if (!m.ativo) continue
    const nome = m.clienteNome.trim().replace(/\s+/g, " ")
    const chave = semAcento(nome)
    if (chave && !vistos.has(chave)) vistos.set(chave, nome)
  }
  return [...vistos.values()].sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }))
}
