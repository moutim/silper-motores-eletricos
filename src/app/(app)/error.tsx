"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

/** Erro de servidor ou de rede em qualquer tela do app (doc 02, 6.7): mensagem curta e "Tentar de novo". */
export default function ErroDoApp({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[erro de tela]", error)
  }, [error])

  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-[21px] font-bold leading-[1.15] tracking-[-0.02em] md:text-2xl">Algo deu errado</h1>
      <p className="max-w-xs text-sm text-text-tertiary">
        Não foi possível carregar esta tela. Verifique a internet e tente de novo. Se a sessão expirou, entre outra vez.
      </p>
      <div className="flex flex-wrap justify-center gap-2.5">
        <Button onClick={reset}>Tentar de novo</Button>
        <Button asChild variant="secondary">
          <Link href="/">Voltar ao Início</Link>
        </Button>
      </div>
    </div>
  )
}
