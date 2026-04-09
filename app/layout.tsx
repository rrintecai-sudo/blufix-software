import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { esES } from '@clerk/localizations'
import './globals.css'

export const metadata: Metadata = {
  title: 'BluFix - Sistema de Gestión de Talleres',
  description: 'Plataforma SaaS para talleres de reparación de celulares',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es" className="dark">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
