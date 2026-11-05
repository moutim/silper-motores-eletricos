import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { destinoSeguro } from "@/lib/acesso"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Entrar" }

type Params = Promise<{ next?: string; error?: string }>

/** Lê a URL dentro do Suspense: o resto da página (logo e moldura) é estático. */
async function Formulario({ searchParams }: { searchParams: Params }) {
  const { next, error } = await searchParams
  return <LoginForm next={destinoSeguro(next)} erro={error ?? null} />
}

export default function LoginPage({ searchParams }: { searchParams: Params }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-[18px] py-10 md:px-9">
      <div className="flex w-full max-w-[400px] flex-col items-center gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/silper-logo.svg"
          alt="Silper Motores Elétricos"
          width={200}
          height={70}
          className="h-auto w-[200px] dark:hidden"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/silper-logo-fundo-escuro.svg"
          alt="Silper Motores Elétricos"
          width={200}
          height={70}
          className="hidden h-auto w-[200px] dark:block"
        />
        <Suspense fallback={<Skeleton className="h-[382px] w-full rounded-card" />}>
          <Formulario searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  )
}
