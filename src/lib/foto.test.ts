import { describe, expect, it } from "vitest"
import { agruparFotos, calcularDimensoes, detectarTipoImagem, validarEnvioFoto } from "./foto"
import type { Foto, OrdemServico } from "./types"

const bytes = (...n: number[]) => new Uint8Array(n)
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0))

describe("tipo real da imagem", () => {
  it("reconhece JPEG, PNG, WebP e HEIC pelos bytes", () => {
    expect(detectarTipoImagem(bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0))).toBe("image/jpeg")
    expect(detectarTipoImagem(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("image/png")
    expect(detectarTipoImagem(bytes(...ascii("RIFF"), 1, 2, 3, 4, ...ascii("WEBP")))).toBe("image/webp")
    expect(detectarTipoImagem(bytes(0, 0, 0, 24, ...ascii("ftyp"), ...ascii("heic")))).toBe("image/heic")
  })
  it("recusa o que não é imagem aceita, mesmo com nome de imagem", () => {
    expect(detectarTipoImagem(bytes(...ascii("<html><body>")))).toBeNull()
    expect(detectarTipoImagem(bytes(0x25, 0x50, 0x44, 0x46))).toBeNull() // PDF
    expect(detectarTipoImagem(bytes())).toBeNull()
    expect(detectarTipoImagem(bytes(0, 0, 0, 24, ...ascii("ftyp"), ...ascii("mp42")))).toBeNull() // vídeo
  })
})

describe("redução (até 2048 px)", () => {
  it("mantém a proporção e nunca amplia", () => {
    expect(calcularDimensoes(4096, 3072)).toEqual({ largura: 2048, altura: 1536 })
    expect(calcularDimensoes(3000, 6000)).toEqual({ largura: 1024, altura: 2048 })
    expect(calcularDimensoes(800, 600)).toEqual({ largura: 800, altura: 600 })
    expect(calcularDimensoes(2048, 2048)).toEqual({ largura: 2048, altura: 2048 })
  })
})

const base = {
  tipo: "EQUIPAMENTO" as const,
  osId: null,
  motorId: "m1",
  motorAtivo: true,
  mimeReal: "image/jpeg" as const,
  tamanhoBytes: 1000,
  fotosDoMotor: 0,
  fotosDaOS: 0,
}

describe("validação do envio (RN-11, doc 01 5.7)", () => {
  it("aceita foto do motor e foto de serviço de O.S. do mesmo motor", () => {
    expect(validarEnvioFoto(base)).toBeNull()
    expect(validarEnvioFoto({ ...base, tipo: "ESQUEMA" })).toBeNull()
    expect(validarEnvioFoto({ ...base, tipo: "SERVICO", osId: "o1", osDoMotorId: "m1" })).toBeNull()
  })
  it("foto de serviço exige O.S.; equipamento e esquema não podem ter O.S.", () => {
    expect(validarEnvioFoto({ ...base, tipo: "SERVICO" })).toBe("TIPO_INCOERENTE")
    expect(validarEnvioFoto({ ...base, tipo: "EQUIPAMENTO", osId: "o1", osDoMotorId: "m1" })).toBe("TIPO_INCOERENTE")
  })
  it("O.S. de outro motor é recusada", () => {
    expect(validarEnvioFoto({ ...base, tipo: "SERVICO", osId: "o1", osDoMotorId: "outro" })).toBe("OS_DE_OUTRO_MOTOR")
  })
  it("recusa tipo inválido, arquivo grande e motor desativado", () => {
    expect(validarEnvioFoto({ ...base, mimeReal: null })).toBe("TIPO_INVALIDO")
    expect(validarEnvioFoto({ ...base, tamanhoBytes: 10 * 1024 * 1024 + 1 })).toBe("TAMANHO_EXCEDIDO")
    expect(validarEnvioFoto({ ...base, tamanhoBytes: 10 * 1024 * 1024 })).toBeNull()
    expect(validarEnvioFoto({ ...base, motorAtivo: false })).toBe("MOTOR_DESATIVADO")
  })
})

const foto = (id: string, tipo: Foto["tipo"], osId: string | null, criadoEm = "1"): Foto => ({
  id, motorId: "m1", osId, tipo, chaveArmazenamento: id, mime: "image/jpeg", tamanhoBytes: 1,
  largura: 1, altura: 1, criadoEm, atualizadoEm: criadoEm, criadoPor: "t", atualizadoPor: "t",
})
const os = (id: string, dataEntrada: string): OrdemServico =>
  ({ id, motorId: "m1", numero: id, dataEntrada, criadoEm: dataEntrada }) as OrdemServico

describe("agrupamento (3.7, RN-11)", () => {
  it("foto de O.S. nunca vira foto do motor", () => {
    const g = agruparFotos(
      [foto("a", "EQUIPAMENTO", null), foto("b", "ESQUEMA", null), foto("c", "SERVICO", "o1"), foto("d", "EQUIPAMENTO", "o1")],
      [os("o1", "2026-11-02")],
    )
    expect(g.motor.equipamento.map((f) => f.id)).toEqual(["a"])
    expect(g.motor.esquema.map((f) => f.id)).toEqual(["b"])
    expect(g.porOS[0].fotos.map((f) => f.id).sort()).toEqual(["c", "d"])
  })
  it("seções de O.S. na ordem do histórico e só com fotos", () => {
    const g = agruparFotos(
      [foto("x", "SERVICO", "antiga"), foto("y", "SERVICO", "nova")],
      [os("antiga", "2025-07-20"), os("nova", "2026-11-02"), os("semfoto", "2026-12-01")],
    )
    expect(g.porOS.map((s) => s.os.id)).toEqual(["nova", "antiga"])
  })
  it("foto de serviço sem O.S. (dado inconsistente) não aparece no motor", () => {
    const g = agruparFotos([foto("z", "SERVICO", null)], [])
    expect(g.motor.equipamento).toHaveLength(0)
    expect(g.motor.esquema).toHaveLength(0)
  })
})
