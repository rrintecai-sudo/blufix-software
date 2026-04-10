import { createClient } from '@/lib/supabase/server'
import { getTenantContext } from '@/lib/tenant'
import { getTasaBCVActual, tasaEstaDesactualizada } from '@/lib/tasa-bcv'
import { TasaBCVWidget } from '@/components/shared/TasaBCVWidget'
import { UserMenu } from '@/components/layout/UserMenu'

export async function Header() {
  const { tenant, usuario, isDemo } = await getTenantContext()
  const tasa = await getTasaBCVActual()
  const desactualizada = tasaEstaDesactualizada(tasa)

  return (
    <header className="h-14 border-b border-border bg-card px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-10">
      {/* Logo visible solo en móvil (en desktop lo muestra el sidebar) */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-white font-display font-bold text-xs">B</span>
        </div>
        <span className="font-display font-bold text-foreground text-base">BluFix</span>
      </div>

      {/* Nombre del taller — solo desktop */}
      <div className="hidden md:block">
        <h1 className="font-display font-semibold text-foreground text-sm">
          {tenant?.nombre ?? 'BluFix'}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <TasaBCVWidget tasa={tasa} desactualizada={desactualizada} />
        {!isDemo && <UserMenu usuario={usuario} />}
      </div>
    </header>
  )
}
