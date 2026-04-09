import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/tenant'
import { formatFechaHora } from '@/lib/utils'
import { PlantillasEditor } from '@/components/whatsapp/PlantillasEditor'
import { MessageCircle } from 'lucide-react'

const EVENTOS_LABEL: Record<string, string> = {
  orden_recibida: 'Orden recibida',
  listo_retirar: 'Listo para retirar',
  entregado: 'Entregado',
  presupuesto_listo: 'Presupuesto listo',
}

export default async function WhatsAppPage() {
  const supabase = createClient()
  const tenantId = await getTenantId()
  if (!tenantId) return null

  const [
    { data: plantillas },
    { data: notificaciones },
  ] = await Promise.all([
    supabase.from('plantillas_whatsapp').select('*').eq('tenant_id', tenantId).order('evento'),
    supabase
      .from('notificaciones_whatsapp')
      .select('*, ordenes(numero_orden)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl text-foreground">WhatsApp</h1>

      {/* Plantillas */}
      <div className="space-y-3">
        <h2 className="font-display font-semibold text-foreground">Plantillas de mensajes</h2>
        <p className="text-sm text-muted-foreground">
          Variables disponibles: <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">{'{cliente}'}</code>{' '}
          <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">{'{modelo}'}</code>{' '}
          <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">{'{numero_orden}'}</code>{' '}
          <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">{'{precio}'}</code>{' '}
          <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">{'{taller}'}</code>
        </p>
        <PlantillasEditor plantillas={plantillas ?? []} />
      </div>

      {/* Log de mensajes */}
      <div className="space-y-3">
        <h2 className="font-display font-semibold text-foreground">Mensajes enviados</h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Orden</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Teléfono</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Mensaje</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(notificaciones ?? []).map((n: any) => (
                <tr key={n.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-primary">#{n.ordenes?.numero_orden ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{n.cliente_telefono}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs max-w-xs truncate">{n.mensaje}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${n.estado === 'enviado' ? 'text-green-400 bg-green-500/20' : n.estado === 'error' ? 'text-red-400 bg-red-500/20' : 'text-yellow-400 bg-yellow-500/20'}`}>
                      {n.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{formatFechaHora(n.enviado_at ?? n.created_at)}</td>
                </tr>
              ))}
              {(!notificaciones || notificaciones.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Sin mensajes enviados aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
