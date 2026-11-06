import { config } from "@/lib/config"
import type { clientesGoogle } from "./sheets/client"

type Drive = ReturnType<typeof clientesGoogle>["drive"]

const MIME_PASTA = "application/vnd.google-apps.folder"

/** Aspas simples no nome quebrariam a consulta do Drive. */
const q = (s: string) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'")

async function acharPasta(drive: Drive, nome: string, pai?: string): Promise<string | null> {
  const r = await drive.files.list({
    q: `name = '${q(nome)}' and mimeType = '${MIME_PASTA}' and trashed = false and 'me' in owners${pai ? ` and '${pai}' in parents` : ""}`,
    fields: "files(id)",
    spaces: "drive",
  })
  return r.data.files?.[0]?.id ?? null
}

async function criarPasta(drive: Drive, nome: string, pai?: string): Promise<string> {
  const r = await drive.files.create({
    requestBody: { name: nome, mimeType: MIME_PASTA, ...(pai ? { parents: [pai] } : {}) },
    fields: "id",
  })
  return r.data.id!
}

/** Pasta central "Silper Motores": guarda a planilha e a subpasta de imagens. Criada no primeiro login. */
export async function garantirPastaCentral(drive: Drive): Promise<string> {
  return (await acharPasta(drive, config.drive.pastaCentral)) ?? (await criarPasta(drive, config.drive.pastaCentral))
}

/** Move um arquivo do app para dentro da pasta, tirando-o de onde estava (ids e links não mudam). */
export async function moverParaPasta(drive: Drive, arquivoId: string, pasta: string, novoNome?: string) {
  const atual = await drive.files.get({ fileId: arquivoId, fields: "parents" })
  const pais = atual.data.parents ?? []
  if (pais.includes(pasta) && !novoNome) return
  await drive.files.update({
    fileId: arquivoId,
    addParents: pais.includes(pasta) ? undefined : pasta,
    removeParents: pais.filter((p) => p !== pasta).join(",") || undefined,
    requestBody: novoNome ? { name: novoNome } : undefined,
    fields: "id",
  })
}

/**
 * Subpasta "Imagens" dentro da pasta central. Se existir a pasta antiga de fotos ("Silper Motores - Fotos",
 * criada antes da pasta central), ela é movida e renomeada: as fotos já enviadas continuam valendo.
 */
export async function garantirPastaImagens(drive: Drive, central: string): Promise<string> {
  const nova = await acharPasta(drive, config.drive.pastaImagens, central)
  if (nova) return nova
  const antiga = await acharPasta(drive, config.drive.pastaFotosAntiga)
  if (antiga) {
    await moverParaPasta(drive, antiga, central, config.drive.pastaImagens)
    return antiga
  }
  return criarPasta(drive, config.drive.pastaImagens, central)
}
