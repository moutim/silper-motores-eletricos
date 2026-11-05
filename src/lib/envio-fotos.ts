import { prepararImagem } from "./imagem-cliente"
import type { TipoFoto } from "./types"

export interface DestinoFoto {
  rastreio: string
  tipo: TipoFoto
  /** Só para foto de serviço. */
  osId?: string | null
}

export type ResultadoEnvioFoto = { ok: true } | { ok: false; mensagem: string }

/** Reduz no navegador e envia uma foto para `/api/fotos`. */
export async function enviarUmaFoto(arquivo: File, destino: DestinoFoto): Promise<ResultadoEnvioFoto> {
  try {
    const { blob, largura, altura } = await prepararImagem(arquivo)
    const form = new FormData()
    form.set("arquivo", blob, arquivo.name.replace(/\.[^.]+$/, "") + ".jpg")
    form.set("rastreio", destino.rastreio)
    form.set("tipo", destino.tipo)
    if (destino.osId) form.set("osId", destino.osId)
    form.set("largura", String(largura))
    form.set("altura", String(altura))
    const res = await fetch("/api/fotos", { method: "POST", body: form })
    const corpo = (await res.json().catch(() => null)) as { ok?: boolean; mensagem?: string } | null
    if (res.ok && corpo?.ok) return { ok: true }
    return { ok: false, mensagem: corpo?.mensagem ?? "Não foi possível enviar a foto. Tente de novo." }
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : "Sem conexão. Tente de novo." }
  }
}

/** Envia várias, uma de cada vez (poupa a rede do celular). Devolve quantas foram e as mensagens das que falharam. */
export async function enviarVariasFotos(
  arquivos: File[],
  destino: DestinoFoto,
  aoProgredir?: (feitas: number, total: number) => void,
): Promise<{ enviadas: number; falhas: string[] }> {
  let enviadas = 0
  const falhas: string[] = []
  for (const [i, arquivo] of arquivos.entries()) {
    aoProgredir?.(i, arquivos.length)
    const r = await enviarUmaFoto(arquivo, destino)
    if (r.ok) enviadas++
    else falhas.push(`${arquivo.name}: ${r.mensagem}`)
  }
  aoProgredir?.(arquivos.length, arquivos.length)
  return { enviadas, falhas }
}
