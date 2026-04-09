import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/tenant'
import { formatFechaHora, formatUSD } from '@/lib/utils'
import { EstadoBadge } from '@/components/shared/EstadoBadge'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { EstadoOrden } from '@/lib/types'

export default async function OrdenesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; tecnico?: string; q?: string }>
}) {
  const params = await searchParams
  const supabase = createClient()
  const tenantId = await getTenantId()
  if (!tenantId) return null

  let query = supabase
    .from('ordenes_resumen')
    .select('id, numero_orden, marca, modelo, estado, cliente_nombre, tecnico_nombre, sucursal_nombre, precio_cobrado_usd, tasa_evento, created_at, hora_prometida')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (params.estado) query = query.eq('estado', params.estado)
  if (params.tecnico) query = query.eq('tecnico_nombre', params.tecnico)
  if (params.q) query = query.or(`cliente_nombre.ilike.%${params.q}%,marca.ilike.%${params.q}%,modelo.ilike.%${params.q}%,numero_orden.eq.${parseInt(params.q) || 0}`)

  const { data: ordenes } = await query
  const { data: tecnicos } = await supabase.from('tecnicos').select('id, nombre').eq('tenant_id', tenantId).eq('activo', true)

  const estados: EstadoOrden[] = ['recibido', 'diagnostico', 'cotizado', 'aprobado', 'en_reparacion', 'listo', 'entregado', 'cancelado']

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-foreground">Órdenes</h1>
        <Link
          href="/ordenes/nueva"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva orden
        </Link>
      </div>

      {/* Filtros */}
      <form className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Buscar cliente, equipo o #orden..."
          className="px-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-64"
        />
        <select
          name="estado"
          defaultValue={params.estado ?? ''}
          className="px-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos los estados</option>
          {estados.map((e) => (
            <option key={e} value={e} className="capitalize">{e.replace('_', ' ')}</option>
          ))}
        </select>
        <select
          name="tecnico"
          defaultValue={params.tecnico ?? ''}
          className="px-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos los técnicos</option>
          {(tecnicos ?? []).map((t) => (
            <option key={t.id} value={t.nombre}>{t.nombre}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          Filtrar
        </button>
        {(params.estado || params.tecnico || params.q) && (
          <Link href="/ordenes" className="px-4 py-2 text-muted-foreground text-sm hover:text-foreground transition-colors">
            Limpiar
          </Link>
        )}
      </form>

      {/* Tabla */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">#</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Equipo</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Cliente</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Técnico</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Sucursal</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Precio</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden xl:table-cell">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(ordenes ?? []).map((o: any) => (
              <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/ordenes/${o.id}`} className="text-primary hover:underline font-medium">
                    #{o.numero_orden}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{o.marca} {o.modelo}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.cliente_nombre}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{o.tecnico_nombre}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{o.sucursal_nombre}</td>
                <td className="px-4 py-3">
                  <EstadoBadge estado={o.estado as EstadoOrden} size="sm" />
                </td>
                <td className="px-4 py-3 text-right hidden lg:table-cell text-foreground">
                  {o.precio_cobrado_usd ? formatUSD(o.precio_cobrado_usd) : '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden xl:table-cell">
                  {formatFechaHora(o.created_at)}
                </td>
              </tr>
            ))}
            {(!ordenes || ordenes.length === 0) && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  No se encontraron órdenes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">{ordenes?.length ?? 0} orden(es) encontrada(s)</p>
    </div>
  )
}
