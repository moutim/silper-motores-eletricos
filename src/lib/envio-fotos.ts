import { toast } from "sonner"
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

export interface FalhaFoto {
  arquivo: File
  mensagem: string
}

/**
 * Envia as fotos e, se alguma falhar, mostra um aviso com "Tentar novamente", que reenvia só as que
 * falharam (e avisa de novo se falharem outra vez). `contexto` abre a frase quando o motor ou a O.S. já
 * foi salvo ("O motor foi salvo. ..."). `aoEnviar` roda a cada rodada que enviou alguma foto.
 */
export async function enviarFotosComAviso(
  arquivos: File[],
  destino: DestinoFoto,
  opcoes: {
    contexto?: string
    aoProgredir?: (feitas: number, total: number) => void
    aoEnviar?: (enviadas: number) => void
  } = {},
): Promise<{ enviadas: number; falhas: FalhaFoto[] }> {
  const resultado = await enviarVariasFotos(arquivos, destino, opcoes.aoProgredir)
  if (resultado.enviadas > 0) opcoes.aoEnviar?.(resultado.enviadas)
  const { falhas } = resultado
  if (falhas.length > 0) {
    const motivo = falhas[0]!.mensagem
    const frase =
      falhas.length === 1
        ? `${falhas[0]!.arquivo.name}: ${motivo}`
        : `${falhas.length} fotos não foram enviadas. ${motivo}`
    toast.error(opcoes.contexto ? `${opcoes.contexto}${frase}` : frase, {
      duration: 20_000,
      action: {
        label: "Tentar novamente",
        onClick: () =>
          void enviarFotosComAviso(
            falhas.map((f) => f.arquivo),
            destino,
            { aoEnviar: opcoes.aoEnviar },
          ),
      },
    })
  }
  return resultado
}

/** Envia várias, uma de cada vez (poupa a rede do celular). Devolve quantas foram e as mensagens das que falharam. */
export async function enviarVariasFotos(
  arquivos: File[],
  destino: DestinoFoto,
  aoProgredir?: (feitas: number, total: number) => void,
): Promise<{ enviadas: number; falhas: FalhaFoto[] }> {
  let enviadas = 0
  const falhas: FalhaFoto[] = []
  for (const [i, arquivo] of arquivos.entries()) {
    aoProgredir?.(i, arquivos.length)
    const r = await enviarUmaFoto(arquivo, destino)
    if (r.ok) enviadas++
    else falhas.push({ arquivo, mensagem: r.mensagem })
  }
  aoProgredir?.(arquivos.length, arquivos.length)
  return { enviadas, falhas }
}
