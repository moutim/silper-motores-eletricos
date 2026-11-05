import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { descricaoMotor } from "@/lib/ficha"
import { nomeCurto } from "@/lib/motor-format"
import type { Motor } from "@/lib/types"
import { MenuMaisMotor } from "./menu-mais-motor"

/**
 * Cartão do motor (doc 02, 6.5): quadro suave com a ilustração animada (3D permitido neste ponto),
 * nome, selo do rastreio, tipo e cliente, e os botões da página.
 */
export function CartaoMotor({ motor }: { motor: Motor }) {
  const nome = nomeCurto(motor)
  const href = `/motores/${encodeURIComponent(motor.rastreio)}`
  const bloqueado = !motor.ativo

  return (
    <section aria-label="Motor" className="rounded-card bg-surface p-3.5 md:px-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-5">
          <div className="flex shrink-0 rounded-[12px] bg-fill px-2 py-1.5 md:px-2.5 md:py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/motor-animado.svg"
              alt="Motor elétrico em funcionamento"
              width={80}
              height={53}
              className="h-[53px] w-20 md:h-[73px] md:w-[110px]"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-3">
              <h1 className="hidden text-2xl font-bold leading-[1.15] tracking-[-0.02em] md:block">{nome}</h1>
              <p className="text-[17px] font-bold leading-[1.15] tracking-[-0.02em] md:hidden">{nome}</p>
              <Badge className="bg-orange-light text-orange-text tabular-nums">{motor.rastreio}</Badge>
            </div>
            <p className="mt-1 text-xs text-text-tertiary md:text-[13px]">{descricaoMotor(motor)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            asChild={!bloqueado}
            variant="secondary"
            disabled={bloqueado}
            className="h-[42px] flex-1 text-[13px] md:flex-none md:px-6"
          >
            {bloqueado ? <span>Editar dados</span> : <Link href={`${href}/editar`}>Editar dados</Link>}
          </Button>
          <Button
            disabled
            title="Disponível em breve"
            className="h-[42px] flex-1 text-[13px] md:flex-none md:px-6"
          >
            Nova O.S.
          </Button>
          <MenuMaisMotor rastreio={motor.rastreio} ativo={motor.ativo} />
        </div>
      </div>
    </section>
  )
}
