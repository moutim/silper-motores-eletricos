"use client"

import { ClipboardTextIcon, EngineIcon, HouseIcon } from "@phosphor-icons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ITENS_MENU, type Secao, secaoAtiva } from "@/lib/navegacao"

export const ICONES_MENU: Record<Secao, React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>> = {
  inicio: HouseIcon,
  motores: EngineIcon,
  os: ClipboardTextIcon,
}

/** Menu lateral do desktop: 240 px, vidro, logo no topo com divisor, 3 itens e a conta no rodapé. */
export function SidebarApp({ conta }: { conta: React.ReactNode }) {
  const ativa = secaoAtiva(usePathname())

  return (
    <Sidebar
      collapsible="none"
      aria-label="Menu principal"
      className="sticky top-0 hidden h-svh w-[240px] shrink-0 border-r border-separator backdrop-blur-xl md:flex"
    >
      <SidebarHeader className="border-b border-separator px-5 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/silper-logo.svg" alt="Silper Motores Elétricos" width={150} height={53} className="h-auto w-[150px] dark:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/silper-logo-fundo-escuro.svg" alt="Silper Motores Elétricos" width={150} height={53} className="hidden h-auto w-[150px] dark:block" />
      </SidebarHeader>

      <SidebarContent className="px-3 py-3">
        <SidebarMenu>
          {ITENS_MENU.map(({ secao, href, rotulo }) => {
            const Icone = ICONES_MENU[secao]
            const ativo = ativa === secao
            return (
              <SidebarMenuItem key={secao}>
                <SidebarMenuButton
                  asChild
                  isActive={ativo}
                  className="h-11 gap-3 rounded-[10px] px-3 text-sm text-text-secondary data-[active=true]:bg-orange-light data-[active=true]:font-semibold data-[active=true]:text-orange-text data-[active=false]:hover:bg-separator"
                >
                  <Link href={href} aria-current={ativo ? "page" : undefined}>
                    <Icone size={24} aria-hidden />
                    {rotulo}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-separator p-3">{conta}</SidebarFooter>
    </Sidebar>
  )
}
