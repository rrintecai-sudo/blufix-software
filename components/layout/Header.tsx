import { createClient } from '@/lib/supabase/server'
import { getTenantContext } from '@/lib/tenant'
import { getTasaBCVActual, tasaEstaDesactualizada } from '@/lib/tasa-bcv'
import { TasaBCVWidget } from '@/components/shared/TasaBCVWidget'
import { UserMenu } from '@/components/layout/UserMenu'

export async function Header() {
  const { tenant, usuario } = await getTenantContext()
  const tasa = await getTasaBCVActual()
  const desactualizada = tasaEstaDesactualizada(tasa)

  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between shrink-0 sticky top-0 z-10">
      {/* Nombre del taller */}
      <div>
        <h1 className="font-display font-semibold text-foreground text-sm">
          {tenant?.nombre ?? 'BluFix'}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Tasa BCV */}
        <TasaBCVWidget tasa={tasa} desactualizada={desactualizada} />

        {/* Usuario */}
        <UserMenu usuario={usuario} />
      </div>
    </header>
  )
}
