import { NextResponse } from "next/server"
import { auth } from "@/server/auth"
import { contextoDaSessao, NaoAutenticadoError } from "@/server/contexto"
import { lerFoto } from "@/server/foto-service"
import { clientesGoogle } from "@/server/sheets/client"
import { PortaFotosSheets } from "@/server/sheets/porta-fotos"
import { ArmazenamentoDrive } from "@/server/storage/drive"

/** Entrega a foto do Drive (a conta logada é a dona do arquivo, por isso o navegador não acessa direto). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { planilha } = await contextoDaSessao()
    const sessao = await auth()
    const { drive } = clientesGoogle(sessao!.accessToken)
    const lida = await lerFoto(new PortaFotosSheets(planilha), new ArmazenamentoDrive(drive, planilha.spreadsheetId), id)
    if (!lida) return new NextResponse("Foto não encontrada", { status: 404 })
    return new NextResponse(new Uint8Array(lida.dados), {
      headers: {
        "Content-Type": lida.foto.mime,
        "Content-Length": String(lida.dados.length),
        // a foto nunca muda (é substituída por outra com outro id), então pode ficar em cache no aparelho
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    })
  } catch (e) {
    if (e instanceof NaoAutenticadoError) return new NextResponse("Não autenticado", { status: 401 })
    console.error("[GET /api/fotos/id]", e)
    return new NextResponse("Erro ao ler a foto", { status: 500 })
  }
}
