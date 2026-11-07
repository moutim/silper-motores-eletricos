import { cn } from "cn"

/** Bloco de carregamento: cinza com brilho que passa (classe `shimmer`, em globals.css; para com prefers-reduced-motion). */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" aria-hidden="true" className={cn("shimmer rounded-md", className)} {...props} />
}

export { Skeleton }
