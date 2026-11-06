import { Readable } from "node:stream"
import { garantirPastaCentral, garantirPastaImagens } from "../drive-pastas"
import type { clientesGoogle } from "../sheets/client"
import type { ArmazenamentoFotos } from "./types"

type Drive = ReturnType<typeof clientesGoogle>["drive"]

const pastas = new Map<string, string>()

/** Fotos no Drive da conta, na pasta "Imagens" dentro da pasta central "Silper Motores". Só enxerga o que o app criou (escopo drive.file). */
export class ArmazenamentoDrive implements ArmazenamentoFotos {
  constructor(
    private readonly drive: Drive,
    private readonly chaveDaConta: string,
  ) {}

  private async pasta(): Promise<string> {
    const guardada = pastas.get(this.chaveDaConta)
    if (guardada) return guardada
    const id = await garantirPastaImagens(this.drive, await garantirPastaCentral(this.drive))
    pastas.set(this.chaveDaConta, id)
    return id
  }

  async enviar(arquivo: { nome: string; mime: string; dados: Buffer }) {
    const parent = await this.pasta()
    const r = await this.drive.files.create({
      requestBody: { name: arquivo.nome, parents: [parent] },
      media: { mimeType: arquivo.mime, body: Readable.from(arquivo.dados) },
      fields: "id",
    })
    return { chave: r.data.id! }
  }

  async ler(chave: string) {
    const r = await this.drive.files.get({ fileId: chave, alt: "media" }, { responseType: "arraybuffer" })
    return Buffer.from(r.data as ArrayBuffer)
  }

  async remover(chave: string) {
    await this.drive.files.update({ fileId: chave, requestBody: { trashed: true } })
  }
}
