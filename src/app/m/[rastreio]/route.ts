import { NextResponse, type NextRequest } from "next/server"

/**
 * Destino do QR Code (RN-19, doc 01 5.7.1): `/m/{rastreio}` leva à ficha. Sem login, o proxy
 * (src/proxy.ts) já manda ao /login e traz de volta para cá depois de entrar.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ rastreio: string }> }) {
  const { rastreio } = await params
  return NextResponse.redirect(new URL(`/motores/${encodeURIComponent(decodeURIComponent(rastreio))}`, req.url))
}
