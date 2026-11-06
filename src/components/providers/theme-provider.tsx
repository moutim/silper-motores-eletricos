"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { usePathname } from "next/navigation"
import type * as React from "react"

/** O app abre sempre no tema claro (D-79), sem seguir o aparelho. O login fica claro mesmo que o tema mude no futuro. */
const ROTAS_SEMPRE_CLARAS = ["/login"]

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const forcarClaro = ROTAS_SEMPRE_CLARAS.includes(pathname)

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme={forcarClaro ? "light" : undefined}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
