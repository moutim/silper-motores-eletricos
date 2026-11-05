import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"

export const metadata: Metadata = { title: "Início" }

export default function Inicio() {
  return <PageHeader titulo="Início" />
}
