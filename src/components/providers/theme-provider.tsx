"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { usePathname } from "next/navigation"
import type * as React from "react"

/** Rotas que ficam sempre no tema claro, qualquer que seja a preferência do aparelho. */
const ROTAS_SEMPRE_CLARAS = ["/login"]

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const forcarClaro = ROTAS_SEMPRE_CLARAS.includes(pathname)

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      forcedTheme={forcarClaro ? "light" : undefined}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
