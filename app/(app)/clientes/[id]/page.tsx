import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatFecha, formatFechaHora, formatUSD } from '@/lib/utils'
import { EstadoBadge } from '@/components/shared/EstadoBadge'
import Link from 'next/link'
import type { EstadoOrden } from '@/lib/types'

export default async function ClienteFichaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()
  const { getTenantId } = await import('@/lib/tenant')
  const tenantId = await getTenantId()
  if (!tenantId) return null

  const { data: cliente } = await supabase.from('clientes').select('*').eq('id', id).eq('tenant_id', tenantId).single()
  if (!cliente) notFound()

  const { data: ordenes } = await supabase
    .from('ordenes_resumen')
    .select('id, numero_orden, marca, modelo, estado, precio_cobrado_usd, created_at, fecha_entrega')
    .eq('cliente_id', id)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  const totalGastado = (ordenes ?? []).reduce((s, o: any) => s + (o.precio_cobrado_usd ?? 0), 0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/clientes" className="text-muted-foreground hover:text-foreground text-sm">← Clientes</Link>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h1 className="font-display font-bold text-2xl text-foreground">{cliente.nombre}</h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {cliente.cedula && <Row label="Cédula" value={cliente.cedula} />}
          <Row label="Teléfono" value={cliente.telefono} />
          {cliente.email && <Row label="Email" value={cliente.email} />}
          {cliente.direccion && <Row label="Dirección" value={cliente.direccion} />}
          <Row label="Total órdenes" value={String(ordenes?.length ?? 0)} />
          <Row label="Total gastado" value={formatUSD(totalGastado)} />
          <Row label="Cliente desde" value={formatFecha(cliente.created_at)} />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-display font-semibold text-foreground">Historial de órdenes</h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Equipo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Precio</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(ordenes ?? []).map((o: any) => (
                <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3"><Link href={`/ordenes/${o.id}`} className="text-primary hover:underline">#{o.numero_orden}</Link></td>
                  <td className="px-4 py-3 text-foreground">{o.marca} {o.modelo}</td>
                  <td className="px-4 py-3"><EstadoBadge estado={o.estado as EstadoOrden} size="sm" /></td>
                  <td className="px-4 py-3 text-right text-foreground">{o.precio_cobrado_usd ? formatUSD(o.precio_cobrado_usd) : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatFechaHora(o.created_at)}</td>
                </tr>
              ))}
              {(!ordenes || ordenes.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Sin órdenes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div><span className="text-muted-foreground">{label}: </span><span className="text-foreground">{value}</span></div>
  )
}
