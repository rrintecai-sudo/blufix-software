import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/tenant'
import { formatFechaHora } from '@/lib/utils'
import { ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default async function MovimientosPage() {
  const supabase = createClient()
  const tenantId = await getTenantId()
  if (!tenantId) return null

  const { data: movimientos } = await supabase
    .from('inventario_movimientos')
    .select('*, inventario(nombre), usuarios(nombre)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/inventario" className="text-muted-foreground hover:text-foreground text-sm">← Inventario</Link>
        <h1 className="font-display font-bold text-2xl text-foreground">Movimientos</h1>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Tipo</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Pieza</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Cantidad</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Notas</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(movimientos ?? []).map((m: any) => (
              <tr key={m.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${
                    m.tipo === 'entrada' ? 'text-green-400' : m.tipo === 'salida' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {m.tipo === 'entrada' ? <ArrowUpCircle className="w-3.5 h-3.5" /> :
                     m.tipo === 'salida' ? <ArrowDownCircle className="w-3.5 h-3.5" /> :
                     <RefreshCw className="w-3.5 h-3.5" />}
                    {m.tipo}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground">{m.inventario?.nombre ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-medium ${m.tipo === 'salida' ? 'text-red-400' : 'text-green-400'}`}>
                    {m.tipo === 'salida' ? '-' : '+'}{m.cantidad}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{m.notas ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{formatFechaHora(m.created_at)}</td>
              </tr>
            ))}
            {(!movimientos || movimientos.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Sin movimientos registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
