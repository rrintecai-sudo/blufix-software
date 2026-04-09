import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/tenant'
import { formatUSD, formatBs, formatFecha, formatTasa, usdToBs } from '@/lib/utils'
import { LiquidacionForm } from '@/components/tecnicos/LiquidacionForm'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns'

export default async function TecnicosPage({
  searchParams,
}: {
  searchParams: Promise<{ tecnico?: string; periodo?: string; desde?: string; hasta?: string }>
}) {
  const params = await searchParams
  const supabase = createClient()
  const tenantId = await getTenantId()
  if (!tenantId) return null

  const { data: tecnicos } = await supabase.from('tecnicos').select('*').eq('tenant_id', tenantId).eq('activo', true).order('nombre')
  const { data: tasaActual } = await supabase.from('tasas_bcv').select('tasa').order('fecha', { ascending: false }).limit(1).single()

  const tecnicoId = params.tecnico ?? tecnicos?.[0]?.id ?? ''
  const tecnico = tecnicos?.find((t) => t.id === tecnicoId)

  // Calcular rango de fechas según período
  const ahora = new Date()
  let desde: Date, hasta: Date
  const periodo = params.periodo ?? 'semana'

  switch (periodo) {
    case 'semana_anterior':
      const semAnt = subWeeks(ahora, 1)
      desde = startOfWeek(semAnt, { weekStartsOn: 1 })
      hasta = endOfWeek(semAnt, { weekStartsOn: 1 })
      break
    case 'mes':
      desde = startOfMonth(ahora)
      hasta = endOfMonth(ahora)
      break
    case 'mes_anterior':
      const mesAnt = subMonths(ahora, 1)
      desde = startOfMonth(mesAnt)
      hasta = endOfMonth(mesAnt)
      break
    case 'personalizado':
      desde = params.desde ? new Date(params.desde) : startOfWeek(ahora, { weekStartsOn: 1 })
      hasta = params.hasta ? new Date(params.hasta) : endOfWeek(ahora, { weekStartsOn: 1 })
      break
    default: // semana
      desde = startOfWeek(ahora, { weekStartsOn: 1 })
      hasta = endOfWeek(ahora, { weekStartsOn: 1 })
  }

  // Obtener órdenes del técnico en el período
  const { data: ordenes } = tecnicoId ? await supabase
    .from('ordenes_resumen')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('tecnico_id', tecnicoId)
    .eq('estado', 'entregado')
    .gte('fecha_entrega', desde.toISOString())
    .lte('fecha_entrega', hasta.toISOString())
    .order('fecha_entrega', { ascending: false }) : { data: [] }

  const totalComisionUSD = (ordenes ?? []).reduce((s, o: any) => s + (o.comision_tecnico_usd ?? 0), 0)
  const tasaPago = tasaActual?.tasa ?? 0
  const totalPagarBs = totalComisionUSD * tasaPago

  const periodos = [
    { value: 'semana', label: 'Esta semana' },
    { value: 'semana_anterior', label: 'Semana anterior' },
    { value: 'mes', label: 'Este mes' },
    { value: 'mes_anterior', label: 'Mes anterior' },
    { value: 'personalizado', label: 'Personalizado' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl text-foreground">Técnicos y Comisiones</h1>

      {/* Filtros */}
      <form className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Técnico</label>
          <select name="tecnico" defaultValue={tecnicoId} className="px-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            {(tecnicos ?? []).map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Período</label>
          <select name="periodo" defaultValue={periodo} className="px-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            {periodos.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        {periodo === 'personalizado' && (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Desde</label>
              <input type="date" name="desde" defaultValue={params.desde} className="px-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Hasta</label>
              <input type="date" name="hasta" defaultValue={params.hasta} className="px-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </>
        )}
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          Ver reporte
        </button>
      </form>

      {tecnico && (
        <>
          {/* Info técnico */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-display font-semibold text-lg text-foreground">{tecnico.nombre}</h2>
                <p className="text-sm text-muted-foreground">
                  {formatFecha(desde.toISOString())} — {formatFecha(hasta.toISOString())}
                  &nbsp;·&nbsp;{tecnico.porcentaje_comision}% comisión
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="font-display font-bold text-xl text-primary">{formatUSD(totalComisionUSD)}</div>
                  <div className="text-xs text-muted-foreground">Total comisión USD</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-xl text-accent">{formatBs(totalPagarBs)}</div>
                  <div className="text-xs text-muted-foreground">A pagar (tasa {formatTasa(tasaPago)})</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de órdenes */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Equipo</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Precio</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Costo</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Ganancia</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Comisión USD</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Comisión Bs.</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(ordenes ?? []).map((o: any) => (
                  <tr key={o.id} className="hover:bg-secondary/20 transition-colors text-sm">
                    <td className="px-4 py-3 text-primary">#{o.numero_orden}</td>
                    <td className="px-4 py-3 text-foreground">{o.marca} {o.modelo}</td>
                    <td className="px-4 py-3 text-right text-foreground">{formatUSD(o.precio_cobrado_usd)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">{formatUSD(o.costo_total_usd)}</td>
                    <td className="px-4 py-3 text-right text-green-400">{formatUSD(o.ganancia_usd)}</td>
                    <td className="px-4 py-3 text-right text-primary font-medium">{formatUSD(o.comision_tecnico_usd)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell">{formatBs(o.comision_tecnico_bs)}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{formatFecha(o.fecha_entrega)}</td>
                  </tr>
                ))}
                {(!ordenes || ordenes.length === 0) && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Sin órdenes entregadas en este período</td>
                  </tr>
                )}
              </tbody>
              {(ordenes ?? []).length > 0 && (
                <tfoot>
                  <tr className="border-t border-border bg-secondary/30">
                    <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-foreground">Totales</td>
                    <td className="px-4 py-3 text-right text-green-400 font-semibold">
                      {formatUSD((ordenes ?? []).reduce((s, o: any) => s + (o.ganancia_usd ?? 0), 0))}
                    </td>
                    <td className="px-4 py-3 text-right text-primary font-bold">
                      {formatUSD(totalComisionUSD)}
                    </td>
                    <td className="px-4 py-3 text-right text-accent font-bold hidden lg:table-cell">
                      {formatBs(totalPagarBs)}
                    </td>
                    <td className="hidden lg:table-cell" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Liquidación */}
          {totalComisionUSD > 0 && (
            <LiquidacionForm
              tecnico={tecnico}
              periodoDesde={desde.toISOString()}
              periodoHasta={hasta.toISOString()}
              totalComisionUSD={totalComisionUSD}
              tasaPago={tasaPago}
            />
          )}
        </>
      )}
    </div>
  )
}
