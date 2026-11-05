import { describe, expect, it } from "vitest"
import { gerarSeed } from "../../scripts/seed-data"
import type { Foto, Motor, OrdemServico } from "@/lib/types"
import { enviarFoto, excluirFoto, lerFoto, type PortaFotos } from "./foto-service"
import type { ArmazenamentoFotos } from "./storage/types"

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4, 5])
const PDF = Buffer.from("%PDF-1.4 conteudo")

function mundo() {
  const seed = gerarSeed("seed")
  const motores: Motor[] = seed.motores.map((m) => ({ ...m }))
  const ordens: OrdemServico[] = seed.ordens.map((o) => ({ ...o }))
  const fotos: (Foto | null)[] = []
  const arquivos = new Map<string, Buffer>()
  const lixeira = new Set<string>()
  let n = 0
  const armazenamento: ArmazenamentoFotos & { falharRemocao?: boolean } = {
    async enviar({ dados }) {
      const chave = `drive-${++n}`
      arquivos.set(chave, dados)
      return { chave }
    },
    async ler(chave) {
      return arquivos.get(chave)!
    },
    async remover(chave) {
      if (armazenamento.falharRemocao) throw new Error("falha no Drive")
      lixeira.add(chave)
      arquivos.delete(chave)
    },
  }
  let falharGravacao = false
  const porta: PortaFotos & { falharGravacao: (v: boolean) => void } = {
    async motorPorRastreio(r) {
      return motores.find((m) => m.rastreioChave === r) ?? null
    },
    async motorPorId(id) {
      return motores.find((m) => m.id === id) ?? null
    },
    async osPorId(id) {
      return ordens.find((o) => o.id === id) ?? null
    },
    async fotosDoMotor(id) {
      return fotos.filter((f): f is Foto => !!f && f.motorId === id)
    },
    async acrescentarFoto(f) {
      if (falharGravacao) throw new Error("falha no Sheets")
      fotos.push(f)
    },
    async buscarFoto(id) {
      const i = fotos.findIndex((f) => f?.id === id)
      return i === -1 ? null : { linha: i + 2, foto: fotos[i]! }
    },
    async limparFoto(l) {
      fotos[l - 2] = null
    },
    falharGravacao: (v) => {
      falharGravacao = v
    },
  }
  return { motores, ordens, fotos, arquivos, lixeira, porta, armazenamento }
}

const ctx = { usuario: "u@x.com", agora: "2026-11-05T12:00:00.000Z" }
const pedido = (extra = {}) => ({ rastreio: "sil-000125", tipo: "EQUIPAMENTO" as const, osId: null, dados: JPEG, largura: 800, altura: 600, ...extra })

describe("enviar foto (RN-11)", () => {
  it("foto do equipamento fica no motor, sem O.S., e o arquivo vai para o armazenamento", async () => {
    const w = mundo()
    const r = await enviarFoto(w.porta, w.armazenamento, ctx, pedido())
    expect(r.ok && r.foto).toMatchObject({ tipo: "EQUIPAMENTO", osId: null, mime: "image/jpeg", largura: 800, altura: 600, criadoPor: "u@x.com" })
    expect(w.arquivos.size).toBe(1)
  })

  it("foto de serviço fica na O.S. e nunca aparece como foto do motor", async () => {
    const w = mundo()
    const os = w.ordens.find((o) => o.numero === "4821")!
    const r = await enviarFoto(w.porta, w.armazenamento, ctx, pedido({ tipo: "SERVICO", osId: os.id }))
    expect(r.ok && r.foto.osId).toBe(os.id)
    const doMotor = (await w.porta.fotosDoMotor(os.motorId)).filter((f) => f.osId === null)
    expect(doMotor).toHaveLength(0)
  })

  it("recusa O.S. de outro motor, tipo incoerente, arquivo que não é imagem e motor desativado", async () => {
    const w = mundo()
    const osOutro = w.ordens.find((o) => o.numero === "4790")! // do Eberle
    expect(await enviarFoto(w.porta, w.armazenamento, ctx, pedido({ tipo: "SERVICO", osId: osOutro.id }))).toEqual({ ok: false, erro: "OS_DE_OUTRO_MOTOR" })
    expect(await enviarFoto(w.porta, w.armazenamento, ctx, pedido({ tipo: "SERVICO" }))).toEqual({ ok: false, erro: "TIPO_INCOERENTE" })
    expect(await enviarFoto(w.porta, w.armazenamento, ctx, pedido({ dados: PDF }))).toEqual({ ok: false, erro: "TIPO_INVALIDO" })
    expect(await enviarFoto(w.porta, w.armazenamento, ctx, pedido({ rastreio: "nada" }))).toEqual({ ok: false, erro: "MOTOR_NAO_ENCONTRADO" })
    expect(await enviarFoto(w.porta, w.armazenamento, ctx, pedido({ tipo: "SERVICO", osId: "x" }))).toEqual({ ok: false, erro: "OS_NAO_ENCONTRADA" })
    w.motores.find((m) => m.rastreio === "SIL-000125")!.ativo = false
    expect(await enviarFoto(w.porta, w.armazenamento, ctx, pedido())).toEqual({ ok: false, erro: "MOTOR_DESATIVADO" })
    expect(w.arquivos.size).toBe(0) // nada foi enviado ao armazenamento nos casos recusados
  })

  it("não deixa arquivo órfão se a gravação na planilha falhar", async () => {
    const w = mundo()
    w.porta.falharGravacao(true)
    await expect(enviarFoto(w.porta, w.armazenamento, ctx, pedido())).rejects.toThrow("falha no Sheets")
    expect(w.arquivos.size).toBe(0)
    expect(w.lixeira.size).toBe(1)
  })
})

describe("excluir foto", () => {
  it("manda o arquivo para a lixeira e tira a foto da lista", async () => {
    const w = mundo()
    const r = await enviarFoto(w.porta, w.armazenamento, ctx, pedido())
    if (!r.ok) throw new Error("falhou")
    expect(await excluirFoto(w.porta, w.armazenamento, r.foto.id)).toEqual({ ok: true })
    expect(w.lixeira.has(r.foto.chaveArmazenamento)).toBe(true)
    expect(await w.porta.buscarFoto(r.foto.id)).toBeNull()
    expect(await excluirFoto(w.porta, w.armazenamento, r.foto.id)).toEqual({ ok: false, erro: "FOTO_NAO_ENCONTRADA" })
  })

  it("motor desativado bloqueia a exclusão; falha no Drive mantém a foto", async () => {
    const w = mundo()
    const r = await enviarFoto(w.porta, w.armazenamento, ctx, pedido())
    if (!r.ok) throw new Error("falhou")
    w.armazenamento.falharRemocao = true
    await expect(excluirFoto(w.porta, w.armazenamento, r.foto.id)).rejects.toThrow()
    expect(await w.porta.buscarFoto(r.foto.id)).not.toBeNull()
    w.armazenamento.falharRemocao = false
    w.motores.find((m) => m.id === r.foto.motorId)!.ativo = false
    expect(await excluirFoto(w.porta, w.armazenamento, r.foto.id)).toEqual({ ok: false, erro: "MOTOR_DESATIVADO" })
  })
})

describe("ler foto", () => {
  it("devolve o conteúdo guardado", async () => {
    const w = mundo()
    const r = await enviarFoto(w.porta, w.armazenamento, ctx, pedido())
    if (!r.ok) throw new Error("falhou")
    const lida = await lerFoto(w.porta, w.armazenamento, r.foto.id)
    expect(lida?.dados.equals(JPEG)).toBe(true)
    expect(await lerFoto(w.porta, w.armazenamento, "nada")).toBeNull()
  })
})
