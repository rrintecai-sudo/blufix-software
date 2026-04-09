import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/tenant'
import { formatFecha } from '@/lib/utils'
import Link from 'next/link'
import { Users } from 'lucide-react'

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = createClient()
  const tenantId = await getTenantId()
  if (!tenantId) return null

  let query = supabase
    .from('clientes')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('nombre')
    .limit(200)

  if (q) query = query.or(`nombre.ilike.%${q}%,cedula.ilike.%${q}%,telefono.ilike.%${q}%`)

  const { data: clientes } = await query

  return (
    <div className="space-y-5">
      <h1 className="font-display font-bold text-2xl text-foreground">Clientes</h1>

      <form className="flex gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, cédula o teléfono..."
          className="px-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-72"
        />
        <button type="submit" className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
          Buscar
        </button>
        {q && <Link href="/clientes" className="px-4 py-2 text-muted-foreground text-sm hover:text-foreground transition-colors self-center">Limpiar</Link>}
      </form>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Cliente</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Cédula</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Teléfono</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Órdenes</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Registrado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(clientes ?? []).map((c: any) => (
              <tr key={c.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{c.nombre}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.cedula ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.telefono}</td>
                <td className="px-4 py-3 text-center hidden lg:table-cell">
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{c.historial_ordenes}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{formatFecha(c.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/clientes/${c.id}`} className="text-xs text-primary hover:underline">Ver ficha</Link>
                </td>
              </tr>
            ))}
            {(!clientes || clientes.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Sin clientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{clientes?.length ?? 0} cliente(s)</p>
    </div>
  )
}
