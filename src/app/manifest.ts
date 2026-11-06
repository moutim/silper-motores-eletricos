import type { MetadataRoute } from "next"
import { TAMANHOS_ICONE_PWA } from "@/lib/app-icon"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Silper Motores Elétricos",
    short_name: "Silper",
    description: "Cadastro de motores e histórico de ordens de serviço da Silper.",
    start_url: "/",
    display: "standalone",
    background_color: "#F2F2F7",
    theme_color: "#F2F2F7",
    icons: [
      // PNGs exigidos pelo Android para oferecer "Instalar app"
      ...TAMANHOS_ICONE_PWA.map((size) => ({
        src: `/pwa-icon/${size}`,
        sizes: `${size}x${size}`,
        type: "image/png",
        purpose: "any" as const,
      })),
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
