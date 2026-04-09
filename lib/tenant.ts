import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import type { Tenant, Usuario } from '@/lib/types'

// Obtener tenant y usuario del contexto de sesión Clerk
export async function getTenantContext(): Promise<{
  tenant: Tenant | null
  usuario: Usuario | null
}> {
  const { userId } = await auth()
  if (!userId) return { tenant: null, usuario: null }

  const supabase = createClient()

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .single()

  if (!usuario) return { tenant: null, usuario: null }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', usuario.tenant_id)
    .single()

  return { tenant, usuario }
}

// Obtener solo el tenant_id del usuario autenticado (más eficiente)
export async function getTenantId(): Promise<string | null> {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createClient()
  const { data } = await supabase
    .from('usuarios')
    .select('tenant_id')
    .eq('id', userId)
    .single()

  return data?.tenant_id ?? null
}
