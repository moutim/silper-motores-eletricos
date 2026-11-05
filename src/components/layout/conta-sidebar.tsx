import { SignOutIcon } from "@phosphor-icons/react/ssr"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { iniciais } from "@/lib/iniciais"
import { sair } from "@/server/actions/sair"
import { usuarioAtual } from "@/server/usuario"

/** Rodapé do menu lateral (desktop): foto, nome, e-mail e Sair (doc 02, 6.2). */
export async function ContaSidebar() {
  const usuario = await usuarioAtual()
  if (!usuario) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5 px-1">
        <Avatar className="size-8">
          {usuario.foto && <AvatarImage src={usuario.foto} alt="" referrerPolicy="no-referrer" />}
          <AvatarFallback className="text-xs font-semibold">{iniciais(usuario.nome)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold leading-tight">{usuario.nome}</p>
          <p className="truncate text-[11px] leading-tight text-text-tertiary">{usuario.email}</p>
        </div>
      </div>
      <form action={sair}>
        <Button
          type="submit"
          variant="ghost"
          className="h-9 w-full justify-start rounded-[10px] px-3 text-[13px] text-text-secondary hover:bg-destructive/10 hover:text-destructive"
        >
          <SignOutIcon aria-hidden="true" />
          Sair
        </Button>
      </form>
    </div>
  )
}
