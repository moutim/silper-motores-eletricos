import { mesCorrente } from "@/lib/format"
import { config } from "@/lib/config"
import { indicadoresDoInicio, motoresRecentes, ultimasOS } from "@/lib/inicio"
import { opcoesDosFiltros } from "@/lib/busca"
import { contextoDaSessao } from "./contexto"
import { SheetsMotorRepository } from "./repositories/sheets-motor-repository"
import { SheetsOSRepository } from "./repositories/sheets-os-repository"
import { PortaDadosSheets } from "./sheets/porta-dados"

/** Todos os motores (ativos e desativados) e todas as O.S. da planilha, lidos com o cache curto dos repositórios (D-09). */
export async function carregarBase() {
  const { planilha, usuario } = await contextoDaSessao()
  const [motores, ordens] = await Promise.all([
    new SheetsMotorRepository(planilha).listar(),
    new SheetsOSRepository(planilha).listar(),
  ])
  return { motores, ordens, planilha, usuario }
}

/** Dados da tela Início (1.1): cartões e listas. As regras estão em lib/inicio.ts. */
export async function carregarInicio() {
  const { motores, ordens, planilha, usuario } = await carregarBase()
  const acessos = (await new PortaDadosSheets(planilha).acessos()).map((a) => a.acesso)
  return {
    indicadores: indicadoresDoInicio(motores, ordens, mesCorrente()),
    recentes: motoresRecentes(acessos, motores, usuario, config.inicio.recentesDesktop),
    ultimasOS: ultimasOS(ordens, motores, config.inicio.ultimasOS),
    opcoes: opcoesDosFiltros(motores.filter((m) => m.ativo)),
    temMotores: motores.some((m) => m.ativo),
  }
}
