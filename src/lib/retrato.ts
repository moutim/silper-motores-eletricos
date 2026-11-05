import type { Bobinagem, Motor, RetratoTecnico } from "./types"

/** Monta o retrato dos dados técnicos gravado na abertura da O.S. (RN-18). */
export function montarRetrato(motor: Motor, bobinagens: Bobinagem[]): RetratoTecnico {
  const {
    marca, modelo, tipoEquipamento, potenciaValor, potenciaUnidade,
    tensao, corrente, rpm, fatorServico, item, pacote, diametro, tipoMotor,
  } = motor
  return {
    motor: {
      marca, modelo, tipoEquipamento, potenciaValor, potenciaUnidade,
      tensao, corrente, rpm, fatorServico, item, pacote, diametro, tipoMotor,
    },
    bobinagens: bobinagens.map(({ funcao, passo, voltas, fio, ligacao, camada }) => ({
      funcao, passo, voltas, fio, ligacao, camada,
    })),
  }
}
