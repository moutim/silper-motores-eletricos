/**
 * Único lugar de configuração das regras de negócio PENDENTES.
 * Cada valor é a PROPOSTA dos documentos enquanto o cliente não decidir.
 * Ao decidir, mude aqui e registre em docs/DECISOES.md.
 */

export const config = {
  rastreio: {
    /** Decidido: prefixo "SILPER-" (era "SIL-" no protótipo; o PDF usa "MOT-"). A sequência é por prefixo: começa em 000001. */
    prefixo: process.env.RASTREIO_PREFIXO ?? "SILPER-",
    digitos: Number(process.env.RASTREIO_DIGITOS ?? 6),
    /** PENDENTE (a confirmar): tamanho e caracteres do rastreio digitado (doc 01, 5.4). */
    tamanhoMin: 3,
    tamanhoMax: 32,
    /** O doc permite "/", mas ele quebra a URL /motores/[rastreio]. Ver DECISOES.md (D-05). */
    padraoDigitado: /^[A-Za-z0-9._-]+$/,
  },

  campos: {
    /** PENDENTE (a confirmar): cliente obrigatório (doc 01, seção 6). */
    clienteObrigatorio: true,
    clienteMin: 2,
    clienteMax: 120,
    /** PENDENTE (a confirmar): data de entrada não pode ser futura. */
    dataEntradaPodeSerFutura: false,
    osNumeroMax: 20,
  },

  fotos: {
    /** PENDENTE: limites (doc 01, 5.7). "quantidade" ainda não existe: null = sem limite. */
    mimesAceitos: ["image/jpeg", "image/png", "image/webp", "image/heic"],
    tamanhoMaxBytes: 10 * 1024 * 1024,
    ladoMaxPx: 2048,
    maxPorMotor: null as number | null,
    maxPorOS: null as number | null,
    /** Qualidade do JPEG gerado na redução feita no navegador. */
    qualidadeJpeg: 0.85,
  },

  /** Organização no Drive da conta: uma pasta central com a planilha e a subpasta de imagens. */
  drive: {
    pastaCentral: "Silper Motores",
    pastaImagens: "Imagens",
    /** Nome da pasta de fotos de antes da pasta central; se existir, é movida e renomeada. */
    pastaFotosAntiga: "Silper Motores - Fotos",
  },

  etiqueta: {
    /** PENDENTE: tamanho de impressão e layout. */
    larguraMm: null as number | null,
    alturaMm: null as number | null,
  },

  /** PENDENTE: listas de tensão e RPM (valores sugeridos no doc 04, seção 3). */
  listas: {
    tensoes: ["110", "220", "380", "440"],
    rpms: ["1730", "3450"],
  },

  busca: {
    esperaMs: 250,
    maxPorGrupo: 20,
  },

  inicio: {
    recentesCelular: 3,
    recentesDesktop: 4,
    ultimasOS: 4,
  },

  fusoHorario: "America/Sao_Paulo",
} as const
