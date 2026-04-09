import { createClient } from '@/lib/supabase/server'
import { getTenantContext } from '@/lib/tenant'
import { getTasaBCVActual } from '@/lib/tasa-bcv'
import { formatUSD, formatBs, formatFecha, formatFechaHora, usdToBs } from '@/lib/utils'
import { EstadoBadge } from '@/components/shared/EstadoBadge'
import { AlertTriangle, ClipboardList, CheckCircle2, DollarSign, Package, Clock } from 'lucide-react'
import Link from 'next/link'
import type { EstadoOrden } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { tenant } = await getTenantContext()
  const tasa = await getTasaBCVActual()
  const hoy = new Date().toISOString().split('T')[0]
  const tid = tenant?.id

  if (!tid) return null

  // Métricas del día
  const [
    { data: ordenesActivas },
    { data: ordenesListas },
    { data: ordenesEntregadasHoy },
    { data: stockBajo },
    { data: garantiasPorVencer },
    { data: equiposAbandanados },
    { data: ordenesRecientes },
    { data: ingresosSemana },
  ] = await Promise.all([
    // Órdenes activas (no entregadas ni canceladas)
    supabase
      .from('ordenes')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tid)
      .not('estado', 'in', '("entregado","cancelado")'),

    // Listas para retirar
    supabase
      .from('ordenes')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tid)
      .eq('estado', 'listo'),

    // Entregadas hoy con monto
    supabase
      .from('ordenes_resumen')
      .select('precio_cobrado_usd, tasa_evento')
      .eq('tenant_id', tid)
      .eq('estado', 'entregado')
      .gte('fecha_entrega', hoy),

    // Stock bajo en inventario
    supabase
      .from('inventario')
      .select('id, nombre, stock_actual, stock_minimo')
      .eq('tenant_id', tid)
      .filter('stock_actual', 'lte', 'stock_minimo')
      .limit(5),

    // Garantías por vencer en 3 días
    supabase
      .from('ordenes')
      .select('id, numero_orden, marca, modelo, garantia_vence, cliente_id')
      .eq('tenant_id', tid)
      .eq('estado', 'entregado')
      .gte('garantia_vence', hoy)
      .lte('garantia_vence', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString())
      .limit(5),

    // Equipos sin movimiento > 30 días
    supabase
      .from('ordenes')
      .select('id, numero_orden, marca, modelo, updated_at')
      .eq('tenant_id', tid)
      .not('estado', 'in', '("entregado","cancelado")')
      .lte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(5),

    // Órdenes recientes (últimas 8)
    supabase
      .from('ordenes_resumen')
      .select('id, numero_orden, marca, modelo, estado, cliente_nombre, tecnico_nombre, created_at, precio_cobrado_usd, tasa_evento')
      .eq('tenant_id', tid)
      .order('created_at', { ascending: false })
      .limit(8),

    // Ingresos últimos 7 días
    supabase
      .from('ordenes_resumen')
      .select('precio_cobrado_usd, tasa_evento, fecha_entrega')
      .eq('tenant_id', tid)
      .eq('estado', 'entregado')
      .gte('fecha_entrega', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  // Calcular totales del día
  const totalHoyUSD = (ordenesEntregadasHoy ?? []).reduce(
    (sum, o) => sum + (o.precio_cobrado_usd ?? 0), 0
  )
  const totalHoyBs = (ordenesEntregadasHoy ?? []).reduce(
    (sum, o) => sum + usdToBs(o.precio_cobrado_usd, o.tasa_evento), 0
  )

  const hayAlertas = (stockBajo?.length ?? 0) > 0 ||
    (garantiasPorVencer?.length ?? 0) > 0 ||
    (equiposAbandanados?.length ?? 0) > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Órdenes activas"
          value={String(ordenesActivas?.length ?? 0)}
          icon={<ClipboardList className="w-5 h-5 text-blue-400" />}
          color="blue"
        />
        <MetricCard
          label="Listas para retirar"
          value={String(ordenesListas?.length ?? 0)}
          icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
          color="green"
        />
        <MetricCard
          label="Facturado hoy (USD)"
          value={formatUSD(totalHoyUSD)}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
          color="primary"
          sub={formatBs(totalHoyBs)}
        />
        <MetricCard
          label="Ingresos (7 días)"
          value={formatUSD(
            (ingresosSemana ?? []).reduce((s, o) => s + (o.precio_cobrado_usd ?? 0), 0)
          )}
          icon={<DollarSign className="w-5 h-5 text-accent" />}
          color="accent"
        />
      </div>

      {/* Alertas */}
      {hayAlertas && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Alertas
          </h2>
          <div className="grid gap-3">
            {(stockBajo ?? []).map((item: any) => (
              <AlertaCard
                key={item.id}
                tipo="stock"
                mensaje={`Stock bajo: ${item.nombre} — ${item.stock_actual} unidad(es) (mínimo: ${item.stock_minimo})`}
                link="/inventario"
              />
            ))}
            {(garantiasPorVencer ?? []).map((o: any) => (
              <AlertaCard
                key={o.id}
                tipo="garantia"
                mensaje={`Garantía próxima a vencer: ${o.marca} ${o.modelo} (Orden #${o.numero_orden}) — vence ${formatFecha(o.garantia_vence)}`}
                link={`/ordenes/${o.id}`}
              />
            ))}
            {(equiposAbandanados ?? []).map((o: any) => (
              <AlertaCard
                key={o.id}
                tipo="abandono"
                mensaje={`Equipo sin movimiento >30 días: ${o.marca} ${o.modelo} (Orden #${o.numero_orden})`}
                link={`/ordenes/${o.id}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Órdenes recientes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-foreground">Órdenes recientes</h2>
          <Link href="/ordenes" className="text-sm text-primary hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Equipo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Técnico</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(ordenesRecientes ?? []).map((o: any) => (
                <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/ordenes/${o.id}`} className="text-primary hover:underline font-medium">
                      #{o.numero_orden}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {o.marca} {o.modelo}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{o.cliente_nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{o.tecnico_nombre}</td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={o.estado as EstadoOrden} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell text-foreground">
                    {o.precio_cobrado_usd ? formatUSD(o.precio_cobrado_usd) : '—'}
                  </td>
                </tr>
              ))}
              {(!ordenesRecientes || ordenesRecientes.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                    No hay órdenes aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'primary' | 'accent'
  sub?: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <div className="font-display font-bold text-xl text-foreground">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  )
}

function AlertaCard({
  tipo,
  mensaje,
  link,
}: {
  tipo: 'stock' | 'garantia' | 'abandono'
  mensaje: string
  link: string
}) {
  const colors = {
    stock:    'border-red-500/30 bg-red-500/10 text-red-400',
    garantia: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    abandono: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  }

  return (
    <Link
      href={link}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm hover:opacity-80 transition-opacity ${colors[tipo]}`}
    >
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>{mensaje}</span>
    </Link>
  )
}
