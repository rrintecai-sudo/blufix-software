import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/tenant'
import { formatFecha, formatUSD, formatBs } from '@/lib/utils'
import Link from 'next/link'
import { FileText } from 'lucide-react'

const ESTADO_COLORS = {
  pendiente: 'text-yellow-400 bg-yellow-500/20',
  aprobado: 'text-green-400 bg-green-500/20',
  rechazado: 'text-red-400 bg-red-500/20',
}

export default async function PresupuestosPage() {
  const supabase = createClient()
  const tenantId = await getTenantId()
  if (!tenantId) return null

  const { data: presupuestos } = await supabase
    .from('presupuestos')
    .select('*, ordenes(numero_orden, marca, modelo, clientes(nombre))')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-5">
      <h1 className="font-display font-bold text-2xl text-foreground">Presupuestos</h1>
      <p className="text-sm text-muted-foreground">Los presupuestos se generan desde el detalle de cada orden.</p>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">#</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Orden / Equipo</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Trabajo</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Total USD</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(presupuestos ?? []).map((p: any) => (
              <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">#{p.numero_presupuesto}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">
                    <Link href={`/ordenes/${p.orden_id}`} className="text-primary hover:underline">
                      Orden #{p.ordenes?.numero_orden}
                    </Link>
                  </div>
                  <div className="text-xs text-muted-foreground">{p.ordenes?.marca} {p.ordenes?.modelo}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs max-w-xs truncate">{p.descripcion_trabajo}</td>
                <td className="px-4 py-3 text-right font-medium text-foreground">{formatUSD(p.total_usd)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_COLORS[p.estado as keyof typeof ESTADO_COLORS]}`}>
                    {p.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{formatFecha(p.created_at)}</td>
              </tr>
            ))}
            {(!presupuestos || presupuestos.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Sin presupuestos generados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
