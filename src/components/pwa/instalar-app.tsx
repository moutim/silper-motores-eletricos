"use client"

import {
  ArrowSquareOutIcon,
  DeviceMobileIcon,
  DotsThreeIcon,
  DotsThreeVerticalIcon,
  DownloadSimpleIcon,
  ExportIcon,
  PlusSquareIcon,
} from "@phosphor-icons/react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer"
import { type PlataformaInstalacao, useInstallPrompt } from "@/hooks/use-install-prompt"

/** "Não mostrar novamente": vale para este aparelho e navegador, então fica no localStorage. */
const CHAVE_PARA_SEMPRE = "silper:instalar-app:nunca-mais"
/** "Agora não": vale até fechar a aba e é separado por tela (quem pula no login vê de novo no início). */
const chaveAgora = (tela: string) => `silper:instalar-app:agora-nao:${tela}`
/** Espera a tela assentar antes de subir a gaveta. */
const ESPERA_MS = 1200

// O storage pode lançar erro (modo privado, cookies bloqueados): na dúvida, o aviso só não lembra.
function lerMarca(storage: () => Storage, chave: string) {
  try {
    return storage().getItem(chave) === "true"
  } catch {
    return false
  }
}
function gravarMarca(storage: () => Storage, chave: string) {
  try {
    storage().setItem(chave, "true")
  } catch {
    // ignora
  }
}
const local = () => window.localStorage
const sessao = () => window.sessionStorage

const PASSOS: Record<PlataformaInstalacao, { icone: ReactNode; texto: ReactNode }[]> = {
  ios: [
    {
      icone: <ExportIcon size={18} />,
      texto: (
        <>
          Toque em <strong>Compartilhar</strong> na barra do navegador (no Safari, ele pode estar dentro do menu <strong>•••</strong>)
        </>
      ),
    },
    {
      icone: <PlusSquareIcon size={18} />,
      texto: (
        <>
          Escolha <strong>Adicionar à Tela de Início</strong>
        </>
      ),
    },
    {
      icone: <DeviceMobileIcon size={18} />,
      texto: (
        <>
          Toque em <strong>Adicionar</strong> e abra a Silper pelo ícone criado
        </>
      ),
    },
  ],
  android: [
    {
      icone: <DotsThreeVerticalIcon size={18} weight="bold" />,
      texto: (
        <>
          Toque no menu <strong>⋮</strong> do navegador
        </>
      ),
    },
    {
      icone: <PlusSquareIcon size={18} />,
      texto: (
        <>
          Escolha <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>
        </>
      ),
    },
    { icone: <DeviceMobileIcon size={18} />, texto: <>Abra a Silper pelo ícone criado</> },
  ],
  inapp: [
    {
      icone: <DotsThreeIcon size={18} weight="bold" />,
      texto: (
        <>
          Toque no menu <strong>•••</strong> ou <strong>⋮</strong> deste app
        </>
      ),
    },
    {
      icone: <ArrowSquareOutIcon size={18} />,
      texto: (
        <>
          Escolha <strong>Abrir no navegador</strong>
        </>
      ),
    },
    { icone: <PlusSquareIcon size={18} />, texto: <>Lá, adicione a Silper à tela de início</> },
  ],
}

/**
 * Gaveta que sugere guardar a Silper na tela inicial do celular, para abrir como app.
 * Só aparece no celular, com a página aberta no navegador (não no modo app). `tela` separa o "Agora não"
 * de cada tela; `ativo` fica falso enquanto outra janela estiver aberta.
 */
export function InstalarApp({ tela, ativo = true }: { tela: "login" | "inicio"; ativo?: boolean }) {
  const { plataforma, modoApp, podePedirInstalacao, pedirInstalacao } = useInstallPrompt()
  const [aberto, setAberto] = useState(false)
  // fechada nesta tela: não reabre nem se o storage falhar
  const fechada = useRef(false)

  useEffect(() => {
    if (!ativo || !plataforma || modoApp || fechada.current) return
    if (lerMarca(local, CHAVE_PARA_SEMPRE) || lerMarca(sessao, chaveAgora(tela))) return
    const t = setTimeout(() => setAberto(true), ESPERA_MS)
    return () => clearTimeout(t)
  }, [ativo, plataforma, modoApp, tela])

  const fechar = () => {
    fechada.current = true
    setAberto(false)
  }
  const agoraNao = () => {
    gravarMarca(sessao, chaveAgora(tela))
    fechar()
  }
  const nuncaMais = () => {
    gravarMarca(local, CHAVE_PARA_SEMPRE)
    fechar()
  }
  const instalar = async () => {
    // fecha a gaveta antes, para o pedido do sistema aparecer sozinho
    agoraNao()
    await pedirInstalacao()
  }

  if (!plataforma || modoApp) return null

  // No Android com o pedido nativo disponível, um toque instala; nos demais, mostramos o passo a passo.
  const pedidoNativo = plataforma === "android" && podePedirInstalacao
  const passos = pedidoNativo ? [] : PASSOS[plataforma]

  return (
    <Drawer open={aberto} onOpenChange={(a) => !a && agoraNao()}>
      <DrawerContent className="px-[18px] pb-[max(24px,env(safe-area-inset-bottom))] pt-2 text-center">
        <span className="mx-auto mt-2 flex size-14 items-center justify-center rounded-[16px] bg-orange-light text-orange-text" aria-hidden="true">
          <DeviceMobileIcon size={26} />
        </span>
        <DrawerTitle className="mt-4 text-xl font-bold tracking-[-0.01em]">Use a Silper Motores Elétricos como app</DrawerTitle>
        <DrawerDescription className="mt-2 px-2 text-sm leading-normal text-text-tertiary">
          {plataforma === "inapp"
            ? "Você está no navegador de outro app. Abra no Safari ou no Chrome para guardar a Silper na tela inicial."
            : "Pela tela inicial a Silper abre em tela cheia, sem a barra do navegador, e fica a um toque de distância."}
        </DrawerDescription>

        {passos.length > 0 && (
          <ol className="mt-6 flex flex-col gap-3 text-left">
            {passos.map((p, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-bg text-blue" aria-hidden="true">
                  {p.icone}
                </span>
                <span className="text-sm leading-snug text-text-secondary">{p.texto}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-6 flex gap-2.5">
          {pedidoNativo ? (
            <>
              <Button type="button" variant="secondary" className="h-12 flex-1 rounded-full" onClick={agoraNao}>
                Agora não
              </Button>
              <Button type="button" className="h-12 flex-1 rounded-full" onClick={instalar}>
                <DownloadSimpleIcon weight="bold" aria-hidden="true" />
                Instalar app
              </Button>
            </>
          ) : (
            <Button type="button" className="h-12 w-full rounded-full" onClick={agoraNao}>
              Entendi
            </Button>
          )}
        </div>

        <button
          type="button"
          onClick={nuncaMais}
          className="mx-auto mt-3 flex min-h-11 items-center px-3 text-[13px] text-text-tertiary underline outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Não mostrar novamente
        </button>
      </DrawerContent>
    </Drawer>
  )
}
