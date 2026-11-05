"use client"

import { CaretRightIcon, PrinterIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { GavetaOuJanela } from "@/components/layout/gaveta-ou-janela"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { QrDesenho } from "@/lib/etiqueta"

const semAssinatura = () => () => {}

function QrSvg({ qr, rastreio, className }: { qr: QrDesenho; rastreio: string; className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${qr.lado} ${qr.lado}`}
      role="img"
      aria-label={`QR Code do motor ${rastreio}`}
      shapeRendering="crispEdges"
      className={className}
    >
      {/* Módulos pretos sobre fundo branco, também no modo escuro (doc 01, 5.7.1). */}
      <rect width={qr.lado} height={qr.lado} fill="#fff" />
      <path d={qr.caminho} fill="#000" />
    </svg>
  )
}

interface Props {
  rastreio: string
  /** "WEG 5 CV" */
  nome: string
  cliente: string
  qr: QrDesenho
  /** Veio do cadastro: mostra "Motor cadastrado". */
  novo: boolean
  /** Acesso direto pela URL: fechar leva à ficha em vez de voltar no histórico. */
  pagina?: boolean
}

/**
 * Etiqueta e QR Code (doc 03, 1.9): aparece ao concluir o cadastro e pelo menu da ficha ("Gerar etiqueta").
 * Imprimir usa a folha de impressão do navegador com QR e rastreio (cópia `.etiqueta-impressao`).
 */
export function EtiquetaJanela({ rastreio, nome, cliente, qr, novo, pagina }: Props) {
  const router = useRouter()
  const pronto = useSyncExternalStore(semAssinatura, () => true, () => false)
  const ficha = `/motores/${encodeURIComponent(rastreio)}`
  const aoFechar = () => (pagina ? router.push(ficha) : router.back())

  return (
    <GavetaOuJanela
      titulo="Etiqueta"
      descricao="Etiqueta do motor com QR Code para abrir a ficha pelo celular."
      aoFechar={aoFechar}
      alturaFixa={false}
      larguraJanela={460}
      rodape={
        <>
          <Button type="button" variant="secondary" className="flex-1 md:flex-none" onClick={aoFechar}>
            Agora não
          </Button>
          <Button type="button" className="flex-1 md:flex-none" onClick={() => window.print()}>
            <PrinterIcon aria-hidden="true" />
            Imprimir etiqueta
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 pt-2 text-center">
        <div>
          {novo && <p className="text-lg font-bold">Motor cadastrado</p>}
          <p className="text-sm text-text-tertiary">{[nome, cliente].filter(Boolean).join(" · ")}</p>
        </div>

        <div className="rounded-[16px] bg-white p-1 shadow-none ring-1 ring-separator">
          <QrSvg qr={qr} rastreio={rastreio} className="size-[220px]" />
        </div>
        <Badge className="bg-orange-light px-3 text-base text-orange-text">{rastreio}</Badge>
        <p className="max-w-[28ch] text-xs text-text-tertiary">
          Aponte a câmera do celular para abrir a ficha deste motor
        </p>

        <a
          href={ficha}
          onClick={(e) => {
            e.preventDefault()
            router.replace(ficha)
          }}
          className="flex w-full items-center justify-between rounded-card bg-bg px-4 py-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Abrir ficha do motor
          <CaretRightIcon size={14} className="text-text-tertiary" aria-hidden="true" />
        </a>
      </div>

      {pronto &&
        createPortal(
          <div className="etiqueta-impressao" aria-hidden="true">
            <QrSvg qr={qr} rastreio={rastreio} className="size-[50mm]" />
            <p style={{ fontSize: "18pt", fontWeight: 700, letterSpacing: "0.02em" }}>{rastreio}</p>
          </div>,
          document.body,
        )}
    </GavetaOuJanela>
  )
}
