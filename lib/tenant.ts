import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { Tenant, Usuario } from '@/lib/types'

const DEMO_TENANT_ID = 'f228900b-a449-4bd7-9963-f50187d14a18'

async function getDemoTenantId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('demo_session')?.value ?? null
}

export async function isDemoMode(): Promise<boolean> {
  return !!(await getDemoTenantId())
}

export async function getTenantContext(): Promise<{
  tenant: Tenant | null
  usuario: Usuario | null
  isDemo: boolean
}> {
  // Demo mode: cookie demo_session presente
  const demoTenantId = await getDemoTenantId()
  if (demoTenantId) {
    const supabase = createClient()
    const { data: tenant } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', demoTenantId)
      .single()
    return {
      tenant,
      usuario: {
        id: 'demo',
        tenant_id: demoTenantId,
        nombre: 'Demo',
        email: 'demo@blufix.pro',
        rol: 'admin',
        activo: true,
      } as Usuario,
      isDemo: true,
    }
  }

  // Clerk mode
  const { userId } = await auth()
  if (!userId) return { tenant: null, usuario: null, isDemo: false }

  const supabase = createClient()
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .single()

  if (!usuario) return { tenant: null, usuario: null, isDemo: false }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', usuario.tenant_id)
    .single()

  return { tenant, usuario, isDemo: false }
}

export async function getTenantId(): Promise<string | null> {
  const demoTenantId = await getDemoTenantId()
  if (demoTenantId) return demoTenantId

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
