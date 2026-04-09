import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/tenant'
import { NuevaOrdenForm } from '@/components/ordenes/NuevaOrdenForm'

export default async function NuevaOrdenPage() {
  const supabase = createClient()
  const tenantId = await getTenantId()
  if (!tenantId) return null

  const [
    { data: clientes },
    { data: tecnicos },
    { data: sucursales },
  ] = await Promise.all([
    supabase.from('clientes').select('id, nombre, telefono, cedula').eq('tenant_id', tenantId).order('nombre').limit(500),
    supabase.from('tecnicos').select('id, nombre').eq('tenant_id', tenantId).eq('activo', true).order('nombre'),
    supabase.from('sucursales').select('id, nombre').eq('tenant_id', tenantId).eq('activo', true).order('nombre'),
  ])

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="font-display font-bold text-2xl text-foreground">Nueva orden</h1>
      <NuevaOrdenForm
        clientes={clientes ?? []}
        tecnicos={tecnicos ?? []}
        sucursales={sucursales ?? []}
      />
    </div>
  )
}
