import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/tenant'
import { formatFecha, formatUSD, formatBs } from '@/lib/utils'
import { NuevoMovimientoForm } from '@/components/caja/NuevoMovimientoForm'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

export default async function CajaPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string; sucursal?: string }>
}) {
  const params = await searchParams
  const supabase = createClient()
  const tenantId = await getTenantId()
  if (!tenantId) return null
  const hoy = params.fecha ?? new Date().toISOString().split('T')[0]

  const [
    { data: movimientos },
    { data: sucursales },
    { data: tasaActual },
  ] = await Promise.all([
    supabase
      .from('caja')
      .select('*, sucursales(nombre), ordenes(numero_orden)')
      .eq('tenant_id', tenantId)
      .eq('fecha', hoy)
      .order('created_at', { ascending: false }),
    supabase.from('sucursales').select('id, nombre').eq('tenant_id', tenantId).eq('activo', true),
    supabase.from('tasas_bcv').select('tasa').order('fecha', { ascending: false }).limit(1).single(),
  ])

  const ingresos = (movimientos ?? []).filter((m: any) => m.tipo === 'ingreso')
  const egresos = (movimientos ?? []).filter((m: any) => m.tipo === 'egreso')
  const totalIngresosUSD = ingresos.reduce((s, m: any) => s + (m.monto_usd ?? 0), 0)
  const totalEgresosUSD = egresos.reduce((s, m: any) => s + (m.monto_usd ?? 0), 0)
  const balanceUSD = totalIngresosUSD - totalEgresosUSD
  const tasa = tasaActual?.tasa ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display font-bold text-2xl text-foreground">Caja Diaria</h1>
        <NuevoMovimientoForm sucursales={sucursales ?? []} tasa={tasa} />
      </div>

      {/* Filtro fecha */}
      <form className="flex gap-3">
        <input type="date" name="fecha" defaultValue={hoy}
          className="px-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        <button type="submit" className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
          Ver
        </button>
      </form>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-2" />
          <div className="font-display font-bold text-lg text-green-400">{formatUSD(totalIngresosUSD)}</div>
          <div className="text-xs text-muted-foreground">Ingresos</div>
          <div className="text-xs text-muted-foreground">{formatBs(totalIngresosUSD * tasa)}</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <TrendingDown className="w-5 h-5 text-red-400 mx-auto mb-2" />
          <div className="font-display font-bold text-lg text-red-400">{formatUSD(totalEgresosUSD)}</div>
          <div className="text-xs text-muted-foreground">Egresos</div>
          <div className="text-xs text-muted-foreground">{formatBs(totalEgresosUSD * tasa)}</div>
        </div>
        <div className={`border rounded-xl p-4 text-center ${balanceUSD >= 0 ? 'bg-primary/10 border-primary/20' : 'bg-red-500/10 border-red-500/20'}`}>
          <DollarSign className={`w-5 h-5 mx-auto mb-2 ${balanceUSD >= 0 ? 'text-primary' : 'text-red-400'}`} />
          <div className={`font-display font-bold text-lg ${balanceUSD >= 0 ? 'text-primary' : 'text-red-400'}`}>{formatUSD(balanceUSD)}</div>
          <div className="text-xs text-muted-foreground">Balance neto</div>
          <div className="text-xs text-muted-foreground">{formatBs(balanceUSD * tasa)}</div>
        </div>
      </div>

      {/* Movimientos */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Tipo</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Concepto</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Categoría</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Monto USD</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Monto Bs.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(movimientos ?? []).map((m: any) => (
              <tr key={m.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${m.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                    {m.tipo}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground">{m.concepto}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell capitalize">{m.categoria?.replace('_', ' ') ?? '—'}</td>
                <td className={`px-4 py-3 text-right font-medium ${m.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                  {m.tipo === 'egreso' ? '-' : ''}{formatUSD(m.monto_usd)}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell">{formatBs(m.monto_bs)}</td>
              </tr>
            ))}
            {(!movimientos || movimientos.length === 0) && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Sin movimientos para {formatFecha(hoy)}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
