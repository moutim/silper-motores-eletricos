import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function OSNaoEncontrada() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-[21px] font-bold leading-[1.15] tracking-[-0.02em] md:text-2xl">O.S. não encontrada</h1>
      <p className="max-w-xs text-sm text-text-tertiary">Não existe O.S. com esse endereço. Volte para a lista de motores.</p>
      <Button asChild>
        <Link href="/motores">Voltar para Motores</Link>
      </Button>
    </div>
  )
}
