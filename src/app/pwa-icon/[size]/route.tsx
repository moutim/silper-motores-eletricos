import { renderizarIconeApp, TAMANHOS_ICONE_PWA } from "@/lib/app-icon"

// PNGs do manifest (/pwa-icon/192 e /pwa-icon/512), gerados no build a partir de generateStaticParams
export function generateStaticParams() {
  return TAMANHOS_ICONE_PWA.map((size) => ({ size: String(size) }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params
  return renderizarIconeApp(Number(size))
}
