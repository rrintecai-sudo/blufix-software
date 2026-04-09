import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { getTenantContext } from '@/lib/tenant'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { tenant, usuario } = await getTenantContext()

  // Si el usuario está autenticado en Clerk pero aún no tiene registro en la BD
  if (!tenant || !usuario) {
    redirect('/onboarding')
  }

  if (!usuario.activo) {
    redirect('/login?error=inactive')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
}
