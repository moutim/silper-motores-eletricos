"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "cn"

/**
 * Área de conteúdo rolável de gavetas e janelas: sem barra de rolagem visível e com um degradê
 * suave no pé enquanto houver conteúdo abaixo, para indicar que a lista continua.
 */
export function AreaRolavel({
  className,
  naoArrastar,
  children,
}: {
  /** Espaçamentos internos (px, pb, pt) da área. */
  className?: string
  /** Gaveta (vaul): impede que rolar o conteúdo arraste a gaveta. */
  naoArrastar?: boolean
  children: React.ReactNode
}) {
  const area = useRef<HTMLDivElement>(null)
  const conteudo = useRef<HTMLDivElement>(null)
  const [maisAbaixo, setMaisAbaixo] = useState(false)

  const medir = useCallback(() => {
    const el = area.current
    if (el) setMaisAbaixo(el.scrollHeight - el.scrollTop - el.clientHeight > 4)
  }, [])

  useEffect(() => {
    medir()
    const obs = new ResizeObserver(medir)
    if (area.current) obs.observe(area.current)
    if (conteudo.current) obs.observe(conteudo.current)
    return () => obs.disconnect()
  }, [medir])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={area}
        onScroll={medir}
        {...(naoArrastar ? { "data-vaul-no-drag": "" } : {})}
        className={cn("no-scrollbar min-h-0 flex-1 overflow-y-auto", className)}
      >
        <div ref={conteudo}>{children}</div>
      </div>
      <div
        aria-hidden="true"
        style={{ background: "linear-gradient(to top, var(--popover), transparent)" }}
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-12 transition-opacity duration-200 motion-reduce:transition-none",
          maisAbaixo ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  )
}
