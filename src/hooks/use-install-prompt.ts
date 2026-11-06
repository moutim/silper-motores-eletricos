import { useSyncExternalStore } from "react"

/**
 * Onde a pessoa está, para escolher as instruções de instalação:
 * - ios: iPhone (Safari, Chrome etc.): só dá para instalar pelo menu Compartilhar
 * - android: celular Android; pode ter o pedido nativo de instalação (beforeinstallprompt)
 * - inapp: navegador embutido de outro app (Instagram, Facebook...): não instala, precisa abrir no navegador
 */
export type PlataformaInstalacao = "ios" | "android" | "inapp"

/** Evento do Chrome/Android que permite abrir o pedido de instalação pelo nosso botão. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const NAVEGADOR_EMBUTIDO = /FBAN|FBAV|FB_IAB|Instagram|LinkedInApp|BytedanceWebview|musical_ly|Line\/|; wv\)/

function detectarPlataforma(): PlataformaInstalacao | null {
  const ua = navigator.userAgent
  const iphone = /iPhone|iPod/.test(ua)
  const androidCelular = /Android/.test(ua) && /Mobile/.test(ua)
  if (!iphone && !androidCelular) return null
  if (NAVEGADOR_EMBUTIDO.test(ua)) return "inapp"
  return iphone ? "ios" : "android"
}

/** Aberto pelo ícone da tela inicial (modo app), e não pelo navegador. */
function detectarModoApp(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS antigo não suporta o display-mode acima
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

// Pedido nativo de instalação (Android), guardado no módulo: o Chrome dispara o evento uma vez só,
// às vezes antes de o componente montar.
let pedidoAdiado: BeforeInstallPromptEvent | null = null
let instalou = false
const ouvintes = new Set<() => void>()
const avisar = () => ouvintes.forEach((o) => o())

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    // o nosso aviso substitui a barrinha de instalação do Chrome
    e.preventDefault()
    pedidoAdiado = e as BeforeInstallPromptEvent
    avisar()
  })
  window.addEventListener("appinstalled", () => {
    pedidoAdiado = null
    instalou = true
    avisar()
  })
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  const consulta = window.matchMedia("(display-mode: standalone)")
  consulta.addEventListener("change", ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
    consulta.removeEventListener("change", ouvinte)
  }
}

// No servidor (e na hidratação) nada é exibido; o cliente re-renderiza com os valores reais.
const servidorNulo = () => null
const servidorFalso = () => false

export function useInstallPrompt() {
  const plataforma = useSyncExternalStore(assinar, detectarPlataforma, servidorNulo)
  const modoApp = useSyncExternalStore(assinar, () => detectarModoApp() || instalou, servidorFalso)
  const podePedirInstalacao = useSyncExternalStore(assinar, () => pedidoAdiado !== null, servidorFalso)

  /** Abre o pedido nativo de instalação; devolve true se a pessoa aceitou. */
  const pedirInstalacao = async (): Promise<boolean> => {
    const pedido = pedidoAdiado
    if (!pedido) return false
    // o evento só pode ser usado uma vez
    pedidoAdiado = null
    avisar()
    await pedido.prompt()
    const { outcome } = await pedido.userChoice
    return outcome === "accepted"
  }

  return { plataforma, modoApp, podePedirInstalacao, pedirInstalacao }
}
