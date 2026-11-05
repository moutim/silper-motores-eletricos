import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MotorNaoEncontrado() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-[21px] font-bold leading-[1.15] tracking-[-0.02em] md:text-2xl">Motor não encontrado</h1>
      <p className="max-w-xs text-sm text-text-tertiary">
        Não existe motor com esse rastreio. Confira o número ou volte para a lista.
      </p>
      <Button asChild>
        <Link href="/motores">Voltar para Motores</Link>
      </Button>
    </div>
  )
}
