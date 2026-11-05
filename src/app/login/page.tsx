import { ClipboardTextIcon, DevicesIcon, GearSixIcon } from "@phosphor-icons/react/ssr"
import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { destinoSeguro } from "@/lib/acesso"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Entrar" }

type Params = Promise<{ next?: string; error?: string }>

const PONTOS = [
  { Icone: GearSixIcon, cor: "text-[#3A55B6]", texto: "Ficha técnica e bobinagem de cada motor" },
  { Icone: ClipboardTextIcon, cor: "text-[#EE6B10]", texto: "Histórico de ordens de serviço por visita" },
  { Icone: DevicesIcon, cor: "text-[#34C759]", texto: "Celular e computador, com os mesmos dados" },
]

/** Lê a URL dentro do Suspense: o resto da página é estático. */
async function Formulario({ searchParams }: { searchParams: Params }) {
  const { next, error } = await searchParams
  return <LoginForm next={destinoSeguro(next)} erro={error ?? null} />
}

export default function LoginPage({ searchParams }: { searchParams: Params }) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-x-hidden bg-background px-5 py-10">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div
          className="login-orb -left-[100px] -top-[100px] size-[400px]"
          style={{ background: "radial-gradient(circle, rgba(244,122,34,.4), transparent 70%)" }}
        />
        <div
          className="login-orb -bottom-[50px] -right-[50px] size-[350px]"
          style={{
            background: "radial-gradient(circle, rgba(58,85,182,.3), transparent 70%)",
            animationDelay: "-3s",
          }}
        />
        <div
          className="login-orb left-1/2 top-[40%] size-[250px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: "radial-gradient(circle, rgba(52,199,89,.2), transparent 70%)",
            animationDelay: "-6s",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-[400px] flex-col items-center gap-5 rounded-[32px] border border-white/60 bg-white/65 px-6 py-8 shadow-[0_20px_40px_rgba(0,0,0,.08),0_1px_3px_rgba(0,0,0,.05)] backdrop-blur-[40px] backdrop-saturate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/silper-logo.svg"
          alt="Silper Motores Elétricos"
          width={200}
          height={70}
          className="h-auto w-[200px]"
        />

        <div className="text-center">
          <h1 className="mb-1.5 text-2xl font-bold tracking-[-0.02em]">Entrar</h1>
          <p className="text-[15px] text-text-secondary">O sistema de motores e ordens de serviço da oficina.</p>
        </div>

        <ul className="flex w-full flex-col gap-3 px-1 py-3">
          {PONTOS.map(({ Icone, cor, texto }) => (
            <li key={texto} className="flex items-center gap-3 text-sm font-medium text-text-secondary">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,.04)] ${cor}`}
                aria-hidden="true"
              >
                <Icone size={20} weight="bold" />
              </span>
              {texto}
            </li>
          ))}
        </ul>

        <div className="w-full">
          <Suspense fallback={<Skeleton className="h-[50px] w-full rounded-2xl" />}>
            <Formulario searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
