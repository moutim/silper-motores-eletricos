import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"

export const metadata: Metadata = { title: "Motores" }

export default function Motores() {
  return <PageHeader titulo="Motores" />
}
