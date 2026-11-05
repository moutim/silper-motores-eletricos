import { previsaoDoProximoRastreio } from "@/server/motores"
import { NovoMotorForm } from "./novo-motor-form"

/** Lê a previsão do rastreio no servidor (planilha) e abre o formulário. */
export async function NovoMotorConteudo({ pagina }: { pagina?: boolean }) {
  const previsto = await previsaoDoProximoRastreio()
  return <NovoMotorForm previsto={previsto} pagina={pagina} />
}
