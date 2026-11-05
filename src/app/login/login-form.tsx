"use client"

import { SpinnerIcon, WarningCircleIcon } from "@phosphor-icons/react"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface Aviso {
  titulo: string
  texto: string
  /** Mostra "Trocar de conta" no lugar de "Entrar com Google". */
  trocarConta?: boolean
}

const AVISOS: Record<string, Aviso> = {
  sem_acesso: {
    titulo: "Conta sem acesso",
    texto: "Esta conta não tem acesso. Fale com o responsável.",
    trocarConta: true,
  },
  drive_permission: {
    titulo: "Faltou a permissão do Google Drive",
    texto:
      "O sistema guarda os dados numa planilha do Drive. Entre de novo e deixe marcada a permissão de acesso ao Drive.",
  },
  drive_quota: {
    titulo: "O Google Drive está cheio",
    texto: "Libere espaço no Drive da conta e tente entrar de novo.",
  },
  setup_failed: {
    titulo: "Não foi possível preparar a planilha",
    texto: "Aguarde um instante e tente entrar novamente. Se continuar, avise o responsável.",
  },
  AccessDenied: {
    titulo: "Acesso negado",
    texto: "O login foi cancelado. Toque em Entrar com Google e aceite as permissões.",
  },
}

const AVISO_GENERICO: Aviso = {
  titulo: "Não foi possível entrar",
  texto: "Aguarde um instante e tente novamente. Se continuar, avise o responsável.",
}

export function LoginForm({ next, erro }: { next: string; erro: string | null }) {
  const [entrando, setEntrando] = useState(false)
  const [erroVisivel, setErroVisivel] = useState(erro)
  const aviso = erroVisivel ? (AVISOS[erroVisivel] ?? AVISO_GENERICO) : null

  async function entrar() {
    setEntrando(true)
    setErroVisivel(null)
    // Tira o ?error= da URL para o aviso não voltar ao recarregar.
    window.history.replaceState(null, "", next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`)
    await signIn("google", { redirectTo: next }, aviso?.trocarConta ? { prompt: "select_account" } : undefined)
  }

  return (
    <div className="flex flex-col gap-3">
      {aviso && (
        <Alert className="border-0 bg-orange-light text-orange-text">
          <WarningCircleIcon size={18} aria-hidden="true" />
          <AlertTitle className="font-semibold">{aviso.titulo}</AlertTitle>
          <AlertDescription className="text-orange-text">{aviso.texto}</AlertDescription>
        </Alert>
      )}

      <Button onClick={entrar} disabled={entrando} aria-busy={entrando} className="w-full">
        {entrando ? (
          <>
            <SpinnerIcon className="animate-spin" aria-hidden="true" />
            Entrando...
          </>
        ) : (
          <>
            <GoogleIcone />
            {aviso?.trocarConta ? "Trocar de conta" : "Entrar com Google"}
          </>
        )}
      </Button>

      <p className="text-center text-xs text-text-tertiary">Use a conta Google da Silper.</p>
    </div>
  )
}

function GoogleIcone() {
  return (
    <svg
      aria-hidden="true"
      width="22"
      height="22"
      viewBox="0 0 18 18"
      fill="none"
      className="rounded-full bg-white p-[3px]"
    >
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  )
}
