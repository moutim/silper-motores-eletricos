import { NextResponse } from "next/server"
import { MENSAGEM_ERRO_FOTO } from "@/lib/foto"
import type { TipoFoto } from "@/lib/types"
import { contextoDaSessao, NaoAutenticadoError } from "@/server/contexto"
import { enviarFoto } from "@/server/foto-service"
import { clientesGoogle } from "@/server/sheets/client"
import { PortaFotosSheets } from "@/server/sheets/porta-fotos"
import { ArmazenamentoDrive } from "@/server/storage/drive"
import { auth } from "@/server/auth"

const TIPOS: TipoFoto[] = ["EQUIPAMENTO", "ESQUEMA", "SERVICO"]
const numero = (v: FormDataEntryValue | null) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null
}

/** Envio de uma foto (multipart). O servidor confere tipo real, tamanho, limites e a regra do motor/O.S. */
export async function POST(req: Request) {
  try {
    const { planilha, usuario } = await contextoDaSessao()
    const sessao = await auth()
    const form = await req.formData()
    const arquivo = form.get("arquivo")
    const rastreio = String(form.get("rastreio") ?? "")
    const tipo = String(form.get("tipo") ?? "") as TipoFoto
    const osId = (form.get("osId") as string | null) || null
    if (!(arquivo instanceof File) || !rastreio || !TIPOS.includes(tipo)) {
      return NextResponse.json({ ok: false, mensagem: "Envio inválido." }, { status: 400 })
    }

    const { drive } = clientesGoogle(sessao!.accessToken)
    const r = await enviarFoto(
      new PortaFotosSheets(planilha),
      new ArmazenamentoDrive(drive, planilha.spreadsheetId),
      { usuario, agora: new Date().toISOString() },
      {
        rastreio,
        tipo,
        osId,
        dados: Buffer.from(await arquivo.arrayBuffer()),
        largura: numero(form.get("largura")),
        altura: numero(form.get("altura")),
      },
    )
    if (!r.ok) return NextResponse.json({ ok: false, codigo: r.erro, mensagem: MENSAGEM_ERRO_FOTO[r.erro] }, { status: 422 })
    return NextResponse.json({ ok: true, id: r.foto.id })
  } catch (e) {
    if (e instanceof NaoAutenticadoError) {
      return NextResponse.json({ ok: false, mensagem: "Sua sessão expirou. Entre de novo." }, { status: 401 })
    }
    console.error("[POST /api/fotos]", e)
    return NextResponse.json({ ok: false, mensagem: "Não foi possível enviar a foto. Tente de novo." }, { status: 500 })
  }
}
