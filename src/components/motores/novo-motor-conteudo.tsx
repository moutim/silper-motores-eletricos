import { previsaoDoProximoRastreio } from "@/server/motores"
import { MotorForm } from "./motor-form"

/** Lê a previsão do rastreio no servidor (planilha) e abre o formulário. */
export async function NovoMotorConteudo({ pagina }: { pagina?: boolean }) {
  const previsto = await previsaoDoProximoRastreio()
  return <MotorForm modo="novo" previsto={previsto} pagina={pagina} />
}
