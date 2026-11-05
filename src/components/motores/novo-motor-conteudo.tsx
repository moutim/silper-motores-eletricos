import { previsaoDoProximoRastreio } from "@/server/motores"
import { MotorForm } from "./motor-form"

/** Lê a previsão do rastreio no servidor (planilha) e abre o formulário. `abrirBase`: abre já a lista de motor-base. */
export async function NovoMotorConteudo({ pagina, abrirBase }: { pagina?: boolean; abrirBase?: boolean }) {
  const previsto = await previsaoDoProximoRastreio()
  return <MotorForm modo="novo" previsto={previsto} pagina={pagina} abrirBase={abrirBase} />
}
