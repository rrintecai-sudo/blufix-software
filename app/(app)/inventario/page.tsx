import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/tenant'
import { formatUSD } from '@/lib/utils'
import { AgregarPiezaForm } from '@/components/inventario/AgregarPiezaForm'
import { Package, AlertTriangle, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function InventarioPage() {
  const supabase = createClient()
  const tenantId = await getTenantId()
  if (!tenantId) return null

  const [
    { data: items },
    { data: proveedores },
    { data: sucursales },
  ] = await Promise.all([
    supabase
      .from('inventario')
      .select('*, proveedores(nombre), sucursales(nombre)')
      .eq('tenant_id', tenantId)
      .order('nombre'),
    supabase.from('proveedores').select('id, nombre').eq('tenant_id', tenantId).eq('activo', true),
    supabase.from('sucursales').select('id, nombre').eq('tenant_id', tenantId).eq('activo', true),
  ])

  const categorias = ['pantalla', 'bateria', 'flex', 'conector', 'camara', 'botones', 'carcasa', 'otro']
  const itemsBajoStock = (items ?? []).filter((i: any) => i.stock_actual <= i.stock_minimo)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Inventario</h1>
          <p className="text-muted-foreground text-sm mt-1">{items?.length ?? 0} pieza(s) registradas</p>
        </div>
        <div className="flex gap-3">
          <Link href="/inventario/movimientos" className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
            Ver movimientos
          </Link>
          <AgregarPiezaForm proveedores={proveedores ?? []} sucursales={sucursales ?? []} />
        </div>
      </div>

      {/* Alertas stock bajo */}
      {itemsBajoStock.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400">{itemsBajoStock.length} pieza(s) con stock bajo</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {itemsBajoStock.map((i: any) => (
              <span key={i.id} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                {i.nombre}: {i.stock_actual}/{i.stock_minimo}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Pieza</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Categoría</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Marca / Modelos</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden xl:table-cell">Proveedor</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Stock</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Costo</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">P. Venta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(items ?? []).map((item: any) => {
              const stockBajo = item.stock_actual <= item.stock_minimo
              return (
                <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{item.nombre}</div>
                    {item.referencia && <div className="text-xs text-muted-foreground">{item.referencia}</div>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">
                      {item.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                    {[item.marca, item.modelo_compatible].filter(Boolean).join(' · ')}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden xl:table-cell">
                    {item.proveedores?.nombre ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      stockBajo ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {stockBajo && <AlertTriangle className="w-3 h-3" />}
                      {item.stock_actual} / {item.stock_minimo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-foreground font-medium">{formatUSD(item.costo_usd)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell">{formatUSD(item.precio_venta_usd)}</td>
                </tr>
              )
            })}
            {(!items || items.length === 0) && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Sin piezas en inventario
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
