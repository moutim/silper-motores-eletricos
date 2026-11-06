import { previsaoDoProximoRastreio } from "@/server/motores"
import { MotorForm } from "./motor-form"

/**
 * Abre o formulário na hora. A previsão do rastreio (leitura da planilha) vai como promessa e aparece
 * quando chegar; se falhar, o formulário continua utilizável e o servidor define o número ao salvar.
 * `abrirBase`: abre já a lista de motor-base.
 */
export function NovoMotorConteudo({ pagina, abrirBase }: { pagina?: boolean; abrirBase?: boolean }) {
  const previsto = previsaoDoProximoRastreio().catch((e) => {
    console.error("[previsão do rastreio]", e)
    return null
  })
  return <MotorForm modo="novo" previsto={previsto} pagina={pagina} abrirBase={abrirBase} />
}
