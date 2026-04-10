import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { DemoBanner } from '@/components/shared/DemoBanner'
import { getTenantContext } from '@/lib/tenant'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { tenant, usuario, isDemo } = await getTenantContext()

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
        {isDemo && <DemoBanner />}
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
}
