import { createClient } from '@/lib/supabase/server'
import { getTenantContext } from '@/lib/tenant'
import { getTasaBCVActual } from '@/lib/tasa-bcv'
import { ConfigTaller } from '@/components/configuracion/ConfigTaller'
import { ConfigSucursales } from '@/components/configuracion/ConfigSucursales'
import { ConfigTecnicos } from '@/components/configuracion/ConfigTecnicos'
import { ConfigProveedores } from '@/components/configuracion/ConfigProveedores'
import { ConfigUsuarios } from '@/components/configuracion/ConfigUsuarios'
import { TasaBCVHistorial } from '@/components/configuracion/TasaBCVHistorial'
import { Settings } from 'lucide-react'

export default async function ConfiguracionPage() {
  const supabase = createClient()
  const { tenant } = await getTenantContext()
  const tasa = await getTasaBCVActual()
  const tenantId = tenant?.id
  if (!tenantId) return null

  const [
    { data: sucursales },
    { data: tecnicos },
    { data: proveedores },
    { data: usuarios },
    { data: historialTasa },
  ] = await Promise.all([
    supabase.from('sucursales').select('*').eq('tenant_id', tenantId).order('nombre'),
    supabase.from('tecnicos').select('*').eq('tenant_id', tenantId).order('nombre'),
    supabase.from('proveedores').select('*').eq('tenant_id', tenantId).order('nombre'),
    supabase.from('usuarios').select('*').eq('tenant_id', tenantId).order('nombre'),
    supabase.from('tasas_bcv').select('*').order('fecha', { ascending: false }).limit(14),
  ])

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-muted-foreground" />
        <h1 className="font-display font-bold text-2xl text-foreground">Configuración</h1>
      </div>

      <ConfigTaller tenant={tenant} />
      <ConfigSucursales sucursales={sucursales ?? []} />
      <ConfigTecnicos tecnicos={tecnicos ?? []} />
      <ConfigProveedores proveedores={proveedores ?? []} />
      <ConfigUsuarios usuarios={usuarios ?? []} />
      <TasaBCVHistorial tasa={tasa} historial={historialTasa ?? []} />
    </div>
  )
}
