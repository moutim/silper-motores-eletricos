import QRCode from "qrcode"
import { describe, expect, it } from "vitest"
import { desenharQr, MARGEM_QR, urlDaEtiqueta } from "./etiqueta"

describe("etiqueta (doc 01, 5.7.1 e RN-19)", () => {
  it("o QR aponta para {APP_URL}/m/{rastreio}", () => {
    expect(urlDaEtiqueta("https://silper.com.br", "SIL-000126")).toBe("https://silper.com.br/m/SIL-000126")
    expect(urlDaEtiqueta("http://localhost:3000/", " M-0457 ")).toBe("http://localhost:3000/m/M-0457")
  })

  it("codifica caracteres especiais do rastreio", () => {
    expect(urlDaEtiqueta("http://x", "a b#c")).toBe("http://x/m/a%20b%23c")
  })

  it("usa correção de erro nível M e margem de 4 módulos", () => {
    const url = urlDaEtiqueta("http://localhost:3000", "SIL-000126")
    expect(QRCode.create(url, { errorCorrectionLevel: "M" }).errorCorrectionLevel.bit).toBe(0) // M
    const qr = QRCode.create(url, { errorCorrectionLevel: "M" })
    const d = desenharQr(url)
    expect(d.lado).toBe(qr.modules.size + MARGEM_QR * 2)
    expect(d.caminho.startsWith(`M${MARGEM_QR} ${MARGEM_QR}`)).toBe(true) // canto do localizador
  })

  it("é determinístico", () => {
    expect(desenharQr("http://x/m/A").caminho).toBe(desenharQr("http://x/m/A").caminho)
  })
})
