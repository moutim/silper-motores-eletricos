import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "Silper Motores Elétricos", template: "%s · Silper" },
  description: "Cadastro de motores e histórico de ordens de serviço da Silper.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="h-full antialiased">
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {/* O tema lê a rota (login é sempre claro); em rotas dinâmicas isso só existe na requisição. */}
        <Suspense fallback={null}>
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
