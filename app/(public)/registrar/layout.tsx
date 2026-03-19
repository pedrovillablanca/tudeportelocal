import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Registrar Club Deportivo | TuDeporteLocal',
  description: 'Registra tu club deportivo en el directorio más completo de Chile. Es gratis y fácil.',
  openGraph: {
    title: 'Registrar Club Deportivo | TuDeporteLocal',
    description: 'Registra tu club deportivo en el directorio más completo de Chile.',
    url: 'https://tudeportelocal.cl/registrar',
    siteName: 'TuDeporteLocal',
    locale: 'es_CL',
    type: 'website'
  }
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
