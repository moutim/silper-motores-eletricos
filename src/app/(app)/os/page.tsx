import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"

export const metadata: Metadata = { title: "Ordens de serviço" }

export default function OrdensServico() {
  return <PageHeader titulo="Ordens de serviço" />
}
