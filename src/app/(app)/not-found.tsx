import Link from "next/link"
import { Button } from "@/components/ui/button"

/** Página 404 do app (doc 03, "Estados globais"). */
export default function NaoEncontrada() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-[21px] font-bold leading-[1.15] tracking-[-0.02em] md:text-2xl">Página não encontrada</h1>
      <p className="max-w-xs text-sm text-text-tertiary">Este endereço não existe. Volte para o Início.</p>
      <Button asChild>
        <Link href="/">Voltar ao Início</Link>
      </Button>
    </div>
  )
}
