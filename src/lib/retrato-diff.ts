import { type Linha, ROTULO_TIPO, linhasBobinagem, linhasTecnicas, ordenarBobinagens, tituloBobinagem } from "./ficha"
import { montarRetrato } from "./retrato"
import type { Bobinagem, Motor, RetratoTecnico } from "./types"

export interface LinhaComparada extends Linha {
  /** O valor é diferente entre o retrato (abertura) e a ficha atual. */
  mudou: boolean
}
export interface SecaoComparada {
  titulo: string
  linhas: LinhaComparada[]
}

function secoes(r: RetratoTecnico): { titulo: string; linhas: Linha[] }[] {
  return [
    {
      titulo: "Dados técnicos",
      linhas: [{ rotulo: "Tipo do motor", valor: ROTULO_TIPO[r.motor.tipoMotor] }, ...linhasTecnicas(r.motor)],
    },
    ...ordenarBobinagens(r.bobinagens).map((b) => ({ titulo: tituloBobinagem(b), linhas: linhasBobinagem(b) })),
  ]
}

function marcar(base: ReturnType<typeof secoes>, outro: ReturnType<typeof secoes>): SecaoComparada[] {
  return base.map((s) => {
    const par = outro.find((o) => o.titulo === s.titulo)
    return {
      titulo: s.titulo,
      linhas: s.linhas.map((l) => ({
        ...l,
        // seção que não existe do outro lado (ex.: bobina auxiliar criada ou descartada) conta como mudança
        mudou: !par || par.linhas.find((x) => x.rotulo === l.rotulo)?.valor !== l.valor,
      })),
    }
  })
}

/**
 * Compara o retrato da abertura com a ficha de hoje (3.5 e 3.6). As duas visões usam as mesmas seções;
 * `mudou` marca o que é diferente do outro lado, para destacar na tela.
 */
export function compararRetrato(
  retrato: RetratoTecnico,
  motorAtual: Motor,
  bobinagensAtuais: Bobinagem[],
): { naAbertura: SecaoComparada[]; fichaAtual: SecaoComparada[]; houveMudanca: boolean } {
  const a = secoes(retrato)
  const h = secoes(montarRetrato(motorAtual, bobinagensAtuais))
  const naAbertura = marcar(a, h)
  const fichaAtual = marcar(h, a)
  const houveMudanca = [...naAbertura, ...fichaAtual].some((s) => s.linhas.some((l) => l.mudou))
  return { naAbertura, fichaAtual, houveMudanca }
}
