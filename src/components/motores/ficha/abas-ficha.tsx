"use client"

import { usePathname, useRouter } from "next/navigation"
import type { Aba } from "@/lib/ficha"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const gatilho =
  "h-auto flex-none basis-0 grow rounded-[8px] border-0 px-1.5 py-2.5 text-xs font-semibold text-text-secondary shadow-none md:py-[7px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"

/**
 * Abas da ficha (doc 02, seção 5: `Tabs`). A aba vive na URL (`?aba=dados|os|fotos`), então o
 * conteúdo é escolhido no servidor e passado como `children`.
 */
export function AbasFicha({ aba, children }: { aba: Aba; children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <Tabs
      value={aba}
      onValueChange={(v) => router.replace(`${pathname}?aba=${v}`, { scroll: false })}
      className="gap-0"
    >
      <TabsList className="mt-1.5 h-auto w-full gap-0.5 rounded-[10px] bg-bg-2 p-0.5 md:w-[480px]">
        <TabsTrigger value="dados" className={gatilho}>
          Dados técnicos
        </TabsTrigger>
        <TabsTrigger value="os" className={gatilho}>
          Ordens de serviço
        </TabsTrigger>
        <TabsTrigger value="fotos" className={gatilho}>
          <span className="md:hidden">Fotos</span>
          <span className="hidden md:inline">Fotos e esquemas</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value={aba} className="mt-3 md:mt-5">
        {children}
      </TabsContent>
    </Tabs>
  )
}
