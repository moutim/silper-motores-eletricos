import { Suspense } from "react"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ContaSidebar } from "@/components/layout/conta-sidebar"
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
      <SidebarApp
        conta={
          <Suspense fallback={<Skeleton className="h-[84px] w-full rounded-[10px]" />}>
            <ContaSidebar />
          </Suspense>
        }
      />
      <div className="min-w-0 flex-1">
        {/* Celular: margem lateral 18 px e rodapé livre para o menu de baixo. Desktop: 36 px. */}
        <main className="px-[18px] pb-[104px] pt-14 md:px-9 md:pb-10 md:pt-9">{children}</main>
      </div>
      <BottomNav />
      {modal}
    </SidebarProvider>
  )
}
