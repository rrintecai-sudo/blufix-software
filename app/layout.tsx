import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { esES } from '@clerk/localizations'
import './globals.css'

export const metadata: Metadata = {
  title: 'BluFix - Sistema de Gestión de Talleres',
  description: 'Plataforma SaaS para talleres de reparación de celulares',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={esES} afterSignOutUrl="/login">
      <html lang="es" className="dark">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
