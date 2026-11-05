import { CaretLeftIcon, WarningCircleIcon } from "@phosphor-icons/react/ssr"
import Link from "next/link"
import { notFound } from "next/navigation"
import { after } from "next/server"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { abaDaUrl } from "@/lib/ficha"
import { carregarFicha, gravarAcessoRecente } from "@/server/motores"
import { AbasFicha } from "./abas-ficha"
import { CartaoMotor } from "./cartao-motor"
import { PainelDados, PainelFotos, PainelOS } from "./paineis"

/** Ficha do motor (3.1 e 3.2): lê o motor no servidor, registra o acesso e monta cartão, abas e painel. */
export async function FichaConteudo({
  params,
  searchParams,
}: {
  params: Promise<{ rastreio: string }>
  searchParams: Promise<{ aba?: string }>
}) {
  const { rastreio } = await params
  const { aba: abaParam } = await searchParams
  const dados = await carregarFicha(rastreio)
  if (!dados) notFound()

  const { motor, bobinagens, usuario, planilha } = dados
  const aba = abaDaUrl(abaParam)
  if (motor.ativo) after(() => gravarAcessoRecente(planilha, usuario, motor.id))

  return (
    <div className="flex flex-col gap-3 md:gap-0">
      <Link
        href="/motores"
        className="mb-2.5 hidden w-fit items-center gap-0.5 text-xs font-semibold text-orange-text md:flex"
      >
        <CaretLeftIcon size={12} weight="bold" aria-hidden="true" />
        Motores
      </Link>

      {!motor.ativo && (
        <Alert className="mb-3 border-0 bg-orange-light text-orange-text">
          <WarningCircleIcon size={18} aria-hidden="true" />
          <AlertTitle className="font-semibold">Motor desativado</AlertTitle>
          <AlertDescription className="text-orange-text">
            Ele não aparece nas listas. Reative pelo menu para editar ou abrir O.S.
          </AlertDescription>
        </Alert>
      )}

      <CartaoMotor motor={motor} />

      <AbasFicha aba={aba}>
        {aba === "dados" && <PainelDados motor={motor} bobinagens={bobinagens} />}
        {aba === "os" && <PainelOS />}
        {aba === "fotos" && <PainelFotos />}
      </AbasFicha>
    </div>
  )
}
