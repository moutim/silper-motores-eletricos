import { Readable } from "node:stream"
import { config } from "@/lib/config"
import type { clientesGoogle } from "../sheets/client"
import type { ArmazenamentoFotos } from "./types"

type Drive = ReturnType<typeof clientesGoogle>["drive"]

const pastas = new Map<string, string>()

/** Fotos no Drive da conta, dentro de uma pasta própria. Só enxerga o que o app criou (escopo drive.file). */
export class ArmazenamentoDrive implements ArmazenamentoFotos {
  constructor(
    private readonly drive: Drive,
    private readonly chaveDaConta: string,
  ) {}

  private async pasta(): Promise<string> {
    const guardada = pastas.get(this.chaveDaConta)
    if (guardada) return guardada
    const nome = config.fotos.pastaDrive
    const busca = await this.drive.files.list({
      q: `name = '${nome}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false and 'me' in owners`,
      fields: "files(id)",
      spaces: "drive",
    })
    let id = busca.data.files?.[0]?.id ?? null
    if (!id) {
      const criada = await this.drive.files.create({
        requestBody: { name: nome, mimeType: "application/vnd.google-apps.folder" },
        fields: "id",
      })
      id = criada.data.id!
    }
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
