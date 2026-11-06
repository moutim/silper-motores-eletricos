import { WarningCircleIcon } from "@phosphor-icons/react/ssr"
import { notFound } from "next/navigation"
import { after } from "next/server"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { abaDaUrl } from "@/lib/ficha"
import { carregarFicha, gravarAcessoRecente } from "@/server/motores"
import { AbasFicha } from "./abas-ficha"
import { CartaoMotor } from "./cartao-motor"
import { PainelOS } from "@/components/os/painel-os"
import { listarOSDoMotor } from "@/server/ordens"
import { PainelFotos } from "@/components/fotos/painel-fotos"
import { listarFotosDoMotor } from "@/server/fotos"
import { PainelDados } from "./paineis"

/** Ficha do motor (3.1 e 3.2): lê o motor no servidor, registra o acesso e monta cartão, abas e painel. */
export async function FichaConteudo({
  params,
  searchParams,
}: {
  params: Promise<{ rastreio: string }>
  searchParams: Promise<{ aba?: string; os?: string }>
}) {
  const { rastreio } = await params
  const { aba: abaParam, os: osParam } = await searchParams
  const dados = await carregarFicha(rastreio)
  if (!dados) notFound()

  const { motor, bobinagens, usuario, planilha } = dados
  const aba = abaDaUrl(abaParam)
  if (motor.ativo) after(() => gravarAcessoRecente(planilha, usuario, motor.id))

  const ordens = aba === "os" || aba === "fotos" ? await listarOSDoMotor(motor.id) : []
  const fotos = aba === "os" || aba === "fotos" ? await listarFotosDoMotor(motor.id) : []

  return (
    <div className="flex flex-col gap-3 md:gap-0">
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
        {aba === "os" && <PainelOS motor={motor} bobinagens={bobinagens} ordens={ordens} fotos={fotos} selecionadaId={osParam} />}
        {aba === "fotos" && <PainelFotos motor={motor} fotos={fotos} ordens={ordens} />}
      </AbasFicha>
    </div>
  )
}
