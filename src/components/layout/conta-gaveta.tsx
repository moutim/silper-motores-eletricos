import { usuarioAtual } from "@/server/usuario"
import { ContaGavetaCliente } from "./conta-gaveta-cliente"

export async function ContaGaveta() {
  const usuario = await usuarioAtual()
  return usuario ? <ContaGavetaCliente usuario={usuario} /> : null
}
