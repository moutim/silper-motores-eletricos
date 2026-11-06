import { SignOutIcon } from "@phosphor-icons/react/ssr"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { iniciais } from "@/lib/iniciais"
import { sair } from "@/server/actions/sair"
import { usuarioAtual } from "@/server/usuario"

/** Rodapé do menu lateral (desktop): foto, nome e e-mail, com o botão Sair (ícone) ao lado, como no financeiro (doc 02, 6.2). */
export async function ContaSidebar() {
  const usuario = await usuarioAtual()
  if (!usuario) return null

  return (
    <div className="flex items-center gap-2.5 px-1">
      <Avatar className="size-8">
        {usuario.foto && <AvatarImage src={usuario.foto} alt="" referrerPolicy="no-referrer" />}
        <AvatarFallback className="text-xs font-semibold">{iniciais(usuario.nome)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold leading-tight">{usuario.nome}</p>
        <p className="truncate text-[11px] leading-tight text-text-tertiary">{usuario.email}</p>
      </div>
      <form action={sair} className="shrink-0">
        <button
          type="submit"
          aria-label="Sair"
          title="Sair"
          className="flex size-8 items-center justify-center rounded-[8px] text-text-tertiary outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SignOutIcon size={18} aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}
