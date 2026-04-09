import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatFecha, formatFechaHora, formatUSD, formatBs, formatTasa, usdToBs } from '@/lib/utils'
import { EstadoBadge } from '@/components/shared/EstadoBadge'
import { OrdenCostos } from '@/components/ordenes/OrdenCostos'
import { OrdenFacturacion } from '@/components/ordenes/OrdenFacturacion'
import { OrdenCambiarEstado } from '@/components/ordenes/OrdenCambiarEstado'
import { OrdenWhatsApp } from '@/components/ordenes/OrdenWhatsApp'
import { CheckCircle2, XCircle, Clock, Printer } from 'lucide-react'
import Link from 'next/link'
import type { EstadoOrden } from '@/lib/types'

export default async function OrdenDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createClient()
  const { getTenantId } = await import('@/lib/tenant')
  const tenantId = await getTenantId()
  if (!tenantId) return null

  const [
    { data: orden },
    { data: costos },
    { data: historial },
    { data: proveedores },
    { data: inventario },
    { data: tecnicos },
    { data: plantillas },
  ] = await Promise.all([
    supabase.from('ordenes_resumen').select('*').eq('id', id).eq('tenant_id', tenantId).single(),
    supabase.from('costos_orden').select('*, proveedores(nombre), inventario(nombre)').eq('orden_id', id).order('created_at'),
    supabase.from('ordenes_historial').select('*').eq('orden_id', id).order('created_at'),
    supabase.from('proveedores').select('id, nombre, costo_cero').eq('tenant_id', tenantId).eq('activo', true),
    supabase.from('inventario').select('id, nombre, stock_actual').eq('tenant_id', tenantId).gt('stock_actual', 0),
    supabase.from('tecnicos').select('id, nombre').eq('tenant_id', tenantId).eq('activo', true),
    supabase.from('plantillas_whatsapp').select('*').eq('tenant_id', tenantId).eq('activo', true),
  ])

  if (!orden) notFound()

  const checklistItems = [
    { label: 'Enciende', value: orden.enciende },
    { label: 'Pantalla', value: orden.pantalla_ok },
    { label: 'Corneta', value: orden.corneta_ok },
    { label: 'Pin carga', value: orden.pin_carga_ok },
    { label: 'Cámara', value: orden.camara_ok },
    { label: 'Botones', value: orden.botones_ok },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/ordenes" className="text-muted-foreground hover:text-foreground text-sm">
              ← Órdenes
            </Link>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display font-bold text-2xl text-foreground">
              Orden #{orden.numero_orden}
            </h1>
            <EstadoBadge estado={orden.estado as EstadoOrden} />
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {orden.marca} {orden.modelo} &mdash; {formatFechaHora(orden.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <OrdenWhatsApp orden={orden} plantillas={plantillas ?? []} />
          <Link
            href={`/ordenes/${id}/recibo`}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Recibo PDF
          </Link>
          <OrdenCambiarEstado orden={orden} tecnicos={tecnicos ?? []} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Columna izquierda */}
        <div className="lg:col-span-2 space-y-5">
          {/* Datos del equipo */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-display font-semibold text-foreground">Equipo</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoRow label="Marca" value={orden.marca} />
              <InfoRow label="Modelo" value={orden.modelo} />
              {orden.imei && <InfoRow label="IMEI" value={orden.imei} />}
              {orden.color && <InfoRow label="Color" value={orden.color} />}
              <div className="col-span-2">
                <InfoRow label="Falla reportada" value={orden.falla_reportada} />
              </div>
              {orden.diagnostico && (
                <div className="col-span-2">
                  <InfoRow label="Diagnóstico" value={orden.diagnostico} />
                </div>
              )}
            </div>

            {/* Checklist */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Estado al recibir</p>
              <div className="flex flex-wrap gap-2">
                {checklistItems.map(({ label, value }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      value === true
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : value === false
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-secondary text-muted-foreground border-border'
                    }`}
                  >
                    {value === true ? <CheckCircle2 className="w-3 h-3" /> : value === false ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {label}
                  </div>
                ))}
              </div>
              {orden.notas_estado && (
                <p className="mt-2 text-sm text-muted-foreground italic">{orden.notas_estado}</p>
              )}
            </div>
          </div>

          {/* Costos */}
          <OrdenCostos
            ordenId={id}
            costos={costos ?? []}
            proveedores={proveedores ?? []}
            inventario={inventario ?? []}
          />

          {/* Facturación */}
          <OrdenFacturacion orden={orden} />
        </div>

        {/* Columna derecha */}
        <div className="space-y-5">
          {/* Info cliente y técnico */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-display font-semibold text-foreground">Asignación</h2>
            <div className="space-y-3 text-sm">
              <InfoRow label="Cliente" value={orden.cliente_nombre} />
              <InfoRow label="Teléfono" value={orden.cliente_telefono} />
              <InfoRow label="Técnico" value={orden.tecnico_nombre} />
              {orden.sucursal_nombre && <InfoRow label="Sucursal" value={orden.sucursal_nombre} />}
              {orden.hora_prometida && <InfoRow label="Hora prometida" value={formatFechaHora(orden.hora_prometida)} />}
            </div>
          </div>

          {/* Resumen financiero */}
          {(orden.precio_cobrado_usd != null) && (
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h2 className="font-display font-semibold text-foreground">Resumen financiero</h2>
              <div className="space-y-2 text-sm">
                <FinancialRow label="Precio cobrado" usd={orden.precio_cobrado_usd} tasa={orden.tasa_evento} />
                <FinancialRow label="Costo total" usd={orden.costo_total_usd} tasa={orden.tasa_evento} negative />
                <div className="border-t border-border pt-2">
                  <FinancialRow label="Ganancia" usd={orden.ganancia_usd} tasa={orden.tasa_evento} highlight />
                </div>
                <FinancialRow label={`Comisión técnico (${orden.porcentaje_comision}%)`} usd={orden.comision_tecnico_usd} tasa={orden.tasa_evento} />
              </div>
              {orden.tasa_evento && (
                <p className="text-xs text-muted-foreground border-t border-border pt-2">
                  Tasa evento: Bs. {formatTasa(orden.tasa_evento)}
                  {orden.fecha_facturacion && ` · ${formatFecha(orden.fecha_facturacion)}`}
                </p>
              )}
            </div>
          )}

          {/* Garantía */}
          {orden.fecha_entrega && (
            <div className="bg-card border border-border rounded-xl p-5 space-y-2 text-sm">
              <h2 className="font-display font-semibold text-foreground">Garantía</h2>
              <InfoRow label="Entregado" value={formatFecha(orden.fecha_entrega)} />
              <InfoRow label="Vence" value={formatFecha(orden.garantia_vence)} />
              <InfoRow label="Días" value={`${orden.garantia_dias} días`} />
            </div>
          )}

          {/* Timeline */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h2 className="font-display font-semibold text-foreground">Historial</h2>
            <div className="space-y-2">
              {(historial ?? []).map((h: any, i: number) => (
                <div key={h.id} className="flex gap-3 text-sm">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    {i < (historial?.length ?? 0) - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-2">
                    <EstadoBadge estado={h.estado_nuevo as EstadoOrden} size="sm" />
                    {h.notas && <p className="text-xs text-muted-foreground mt-0.5">{h.notas}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">{formatFechaHora(h.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className="text-foreground">{value ?? '—'}</span>
    </div>
  )
}

function FinancialRow({
  label, usd, tasa, negative, highlight
}: {
  label: string
  usd: number | null
  tasa: number | null
  negative?: boolean
  highlight?: boolean
}) {
  const bs = usdToBs(usd, tasa)
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right">
        <div className={`font-medium ${highlight ? 'text-green-400' : negative ? 'text-red-400' : 'text-foreground'}`}>
          {negative ? '- ' : ''}{formatUSD(usd)}
        </div>
        <div className="text-xs text-muted-foreground">{formatBs(bs)}</div>
      </div>
    </div>
  )
}
