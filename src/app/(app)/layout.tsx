import { Suspense } from "react"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ContaSidebar } from "@/components/layout/conta-sidebar"
import { InstalarApp } from "@/components/pwa/instalar-app"
import { SidebarApp } from "@/components/layout/sidebar-app"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export default function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <a
        href="#conteudo"
        className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-full bg-surface px-4 py-2 text-sm font-semibold shadow-md outline-none focus:translate-y-0 focus-visible:ring-2 focus-visible:ring-ring"
      >
        Pular para o conteúdo
      </a>
      <SidebarApp
        conta={
          <Suspense fallback={<Skeleton className="h-[84px] w-full rounded-[10px]" />}>
            <ContaSidebar />
          </Suspense>
        }
      />
      <div className="min-w-0 flex-1">
        {/* Celular: margem lateral 18 px e rodapé livre para o menu de baixo. Desktop: 36 px. */}
        <main id="conteudo" tabIndex={-1} className="outline-none px-[18px] pb-[104px] pt-14 md:px-9 md:pb-10 md:pt-9">{children}</main>
      </div>
      <BottomNav />
      {modal}
      <InstalarApp tela="inicio" />
    </SidebarProvider>
  )
}
