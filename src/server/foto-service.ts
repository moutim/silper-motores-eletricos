import { detectarTipoImagem, type ErroFoto, validarEnvioFoto } from "@/lib/foto"
import { normalizarRastreio } from "@/lib/rastreio"
import type { Foto, Motor, OrdemServico, TipoFoto } from "@/lib/types"
import type { ArmazenamentoFotos } from "./storage/types"

/** Porta de dados das fotos: Google Sheets em produção, memória nos testes. */
export interface PortaFotos {
  motorPorRastreio(rastreio: string): Promise<Motor | null>
  motorPorId(id: string): Promise<Motor | null>
  osPorId(id: string): Promise<OrdemServico | null>
  fotosDoMotor(motorId: string): Promise<Foto[]>
  acrescentarFoto(foto: Foto): Promise<void>
  buscarFoto(id: string): Promise<{ linha: number; foto: Foto } | null>
  limparFoto(linha: number): Promise<void>
}

interface Contexto {
  usuario: string
  agora: string
  novoId?: () => string
}

export type ResultadoEnvio =
  | { ok: true; foto: Foto }
  | { ok: false; erro: ErroFoto | "MOTOR_NAO_ENCONTRADO" | "OS_NAO_ENCONTRADA" }

/**
 * Guarda uma foto do motor (equipamento ou esquema) ou de uma O.S. (serviço). O tipo é conferido pelo
 * conteúdo do arquivo, e a foto de O.S. nunca vira foto do motor (RN-11).
 */
export async function enviarFoto(
  porta: PortaFotos,
  armazenamento: ArmazenamentoFotos,
  ctx: Contexto,
  pedido: {
    rastreio: string
    tipo: TipoFoto
    osId: string | null
    dados: Buffer
    largura: number | null
    altura: number | null
  },
): Promise<ResultadoEnvio> {
  const motor = await porta.motorPorRastreio(normalizarRastreio(pedido.rastreio))
  if (!motor) return { ok: false, erro: "MOTOR_NAO_ENCONTRADO" }

  let os: OrdemServico | null = null
  if (pedido.osId !== null) {
    os = await porta.osPorId(pedido.osId)
    if (!os) return { ok: false, erro: "OS_NAO_ENCONTRADA" }
  }

  const existentes = await porta.fotosDoMotor(motor.id)
  const mimeReal = detectarTipoImagem(pedido.dados)
  const erro = validarEnvioFoto({
    tipo: pedido.tipo,
    osId: pedido.osId,
    osDoMotorId: os?.motorId ?? null,
    motorId: motor.id,
    motorAtivo: motor.ativo,
    mimeReal,
    tamanhoBytes: pedido.dados.length,
    fotosDoMotor: existentes.filter((f) => f.osId === null).length,
    fotosDaOS: pedido.osId ? existentes.filter((f) => f.osId === pedido.osId).length : 0,
  })
  if (erro) return { ok: false, erro }

  const id = (ctx.novoId ?? crypto.randomUUID.bind(crypto))()
  const ext = mimeReal === "image/jpeg" ? "jpg" : mimeReal === "image/png" ? "png" : mimeReal === "image/webp" ? "webp" : "heic"
  const { chave } = await armazenamento.enviar({ nome: `${motor.rastreio}-${pedido.tipo.toLowerCase()}-${id}.${ext}`, mime: mimeReal!, dados: pedido.dados })

  const foto: Foto = {
    id,
    motorId: motor.id,
    osId: pedido.osId,
    tipo: pedido.tipo,
    chaveArmazenamento: chave,
    mime: mimeReal!,
    tamanhoBytes: pedido.dados.length,
    largura: pedido.largura,
    altura: pedido.altura,
    criadoEm: ctx.agora,
    atualizadoEm: ctx.agora,
    criadoPor: ctx.usuario,
    atualizadoPor: ctx.usuario,
  }
  try {
    await porta.acrescentarFoto(foto)
  } catch (e) {
    await armazenamento.remover(chave).catch(() => undefined) // não deixa arquivo órfão no Drive
    throw e
  }
  return { ok: true, foto }
}

export type ResultadoExclusao = { ok: true } | { ok: false; erro: "FOTO_NAO_ENCONTRADA" | "MOTOR_DESATIVADO" }

/** Exclui a foto: o arquivo vai para a lixeira do Drive e a foto sai da lista. Motor desativado bloqueia. */
export async function excluirFoto(
  porta: PortaFotos,
  armazenamento: ArmazenamentoFotos,
  id: string,
): Promise<ResultadoExclusao> {
  const achada = await porta.buscarFoto(id)
  if (!achada) return { ok: false, erro: "FOTO_NAO_ENCONTRADA" }
  const motor = await porta.motorPorId(achada.foto.motorId)
  if (motor && !motor.ativo) return { ok: false, erro: "MOTOR_DESATIVADO" }
  await armazenamento.remover(achada.foto.chaveArmazenamento) // se falhar, a foto continua na lista
  await porta.limparFoto(achada.linha)
  return { ok: true }
}

/** Conteúdo de uma foto para exibir (rota `/api/fotos/[id]`). */
export async function lerFoto(
  porta: PortaFotos,
  armazenamento: ArmazenamentoFotos,
  id: string,
): Promise<{ foto: Foto; dados: Buffer } | null> {
  const achada = await porta.buscarFoto(id)
  if (!achada) return null
  return { foto: achada.foto, dados: await armazenamento.ler(achada.foto.chaveArmazenamento) }
}
