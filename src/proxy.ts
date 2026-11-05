import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/server/auth.config"

const { auth } = NextAuth(authConfig)

/** Toda rota exige sessão (doc 01, seção 7). Sem sessão, vai ao /login e volta depois (?next=). */
export default auth((req) => {
  const { pathname, search } = req.nextUrl
  const logado = !!req.auth && !req.auth.error

  if (pathname === "/login") {
    if (logado) return NextResponse.redirect(new URL("/", req.nextUrl.origin))
    return NextResponse.next()
  }
  if (logado) return NextResponse.next()

  const login = new URL("/login", req.nextUrl.origin)
  if (pathname !== "/") login.searchParams.set("next", pathname + search)
  return NextResponse.redirect(login)
})

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|assets/|favicon.ico|.*\\.(?:svg|png|ico|webp)$).*)"],
}
