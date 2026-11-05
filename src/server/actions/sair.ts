"use server"

import { signOut } from "@/server/auth"

export async function sair() {
  await signOut({ redirectTo: "/login" })
}
