import { formularioDoMotor } from "./motor-edicao"
import type { MotorFormValues } from "./motor-schema"
import type { Bobinagem, Motor } from "./types"

/**
 * Formulário preenchido a partir de um motor-base (RN-10, doc 01 5.3): copia dados técnicos e
 * bobinagem; NÃO copia cliente (fica em branco e obrigatório), rastreio, O.S. nem fotos.
 */
export function formularioDeModelo(modelo: Motor, bobinagens: Bobinagem[]): MotorFormValues {
  return { ...formularioDoMotor(modelo, bobinagens), clienteNome: "", rastreioModo: "AUTOMATICO", rastreio: "" }
}
