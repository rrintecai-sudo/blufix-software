import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTenantContext } from '@/lib/tenant'
import { ReciboViewer } from '@/components/pdf/ReciboViewer'

export default async function ReciboPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()
  const { tenant, usuario } = await getTenantContext()
  if (!usuario) notFound()
  const tenantId = usuario.tenant_id

  const { data: orden } = await supabase.from('ordenes_resumen').select('*').eq('id', id).eq('tenant_id', tenantId).single()
  if (!orden) notFound()

  const { data: costos } = await supabase.from('costos_orden').select('*').eq('orden_id', id).order('created_at')

  return <ReciboViewer orden={orden} costos={costos ?? []} tenant={tenant} />
}
