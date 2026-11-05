import { notFound } from "next/navigation"
import { desenharQr, urlDaEtiqueta } from "@/lib/etiqueta"
import { nomeCurto } from "@/lib/motor-format"
import { carregarFicha } from "@/server/motores"
import { EtiquetaJanela } from "./etiqueta-janela"

/** Carrega o motor e gera o QR no servidor com `APP_URL` (RN-19). Funciona também para motor desativado. */
export async function EtiquetaConteudo({
  params,
  novo,
  pagina,
}: {
  params: Promise<{ rastreio: string }>
  novo: boolean
  pagina?: boolean
}) {
  const { rastreio } = await params
  const dados = await carregarFicha(rastreio)
  if (!dados) notFound()
  const { motor } = dados
  const appUrl = process.env.APP_URL || "http://localhost:3000"
  return (
    <EtiquetaJanela
      rastreio={motor.rastreio}
      nome={nomeCurto(motor)}
      cliente={motor.clienteNome}
      qr={desenharQr(urlDaEtiqueta(appUrl, motor.rastreio))}
      novo={novo}
      pagina={pagina}
    />
  )
}
