import { ClipboardTextIcon, DevicesIcon, GearSixIcon } from "@phosphor-icons/react/ssr"
import type { Metadata } from "next"
import { Suspense } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { destinoSeguro } from "@/lib/acesso"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Entrar" }

type Params = Promise<{ next?: string; error?: string }>

const PONTOS = [
  { Icone: GearSixIcon, cor: "bg-[#3A55B6]", texto: "Ficha técnica e bobinagem de cada motor" },
  { Icone: ClipboardTextIcon, cor: "bg-[#EE6B10]", texto: "Histórico de ordens de serviço por visita" },
  { Icone: DevicesIcon, cor: "bg-[#34C759]", texto: "Celular e computador, com os mesmos dados" },
]

/** Lê a URL dentro do Suspense: o resto da página é estático. */
async function Formulario({ searchParams }: { searchParams: Params }) {
  const { next, error } = await searchParams
  return <LoginForm next={destinoSeguro(next)} erro={error ?? null} />
}

export default function LoginPage({ searchParams }: { searchParams: Params }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-[18px] py-10 md:px-9">
      <Card className="w-full max-w-[400px] items-center gap-5 px-6 pb-6 pt-9">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/silper-logo.svg"
          alt="Silper Motores Elétricos"
          width={200}
          height={70}
          className="h-auto w-[200px]"
        />

        <div className="text-center">
          <h1 className="text-[21px] font-bold leading-[1.15] tracking-[-0.02em] md:text-2xl">Entrar</h1>
          <p className="mt-1.5 text-sm text-text-tertiary">
            O sistema de motores e ordens de serviço da oficina.
          </p>
        </div>

        <ul className="flex w-full flex-col gap-3 py-1">
          {PONTOS.map(({ Icone, cor, texto }) => (
            <li key={texto} className="flex items-center gap-3 text-sm font-medium text-text-secondary">
              <span
                className={`flex size-[30px] shrink-0 items-center justify-center rounded-[8px] text-white ${cor}`}
                aria-hidden="true"
              >
                <Icone size={18} />
              </span>
              {texto}
            </li>
          ))}
        </ul>

        <div className="w-full">
          <Suspense fallback={<Skeleton className="h-[46px] w-full rounded-pill" />}>
            <Formulario searchParams={searchParams} />
          </Suspense>
        </div>
      </Card>
    </main>
  )
}
