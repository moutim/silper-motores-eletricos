import { SignOutIcon } from "@phosphor-icons/react/ssr"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { auth, signOut } from "@/server/auth"

async function Conta() {
  const sessao = await auth()
  return sessao?.user?.email ? ` como ${sessao.user.email}` : ""
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-3 px-[18px] md:px-9">
      <h1 className="text-[21px] font-bold leading-[1.15] tracking-[-0.02em] md:text-2xl">
        Silper Motores Elétricos
      </h1>
      <p className="text-xs font-medium text-text-tertiary">
        Login feito
        <Suspense>
          <Conta />
        </Suspense>
        . As telas começam na Fase 1.
      </p>
      <form
        action={async () => {
          "use server"
          await signOut({ redirectTo: "/login" })
        }}
      >
        <Button type="submit" variant="outline">
          <SignOutIcon aria-hidden="true" />
          Sair
        </Button>
      </form>
    </main>
  )
}
