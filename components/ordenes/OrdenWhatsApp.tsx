'use client'

import { useState, useTransition } from 'react'
import { registrarNotificacionWhatsapp } from '@/app/actions/db'
import { generarMensajeOrden, abrirWhatsApp } from '@/lib/whatsapp'
import { MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { PlantillaWhatsapp } from '@/lib/types'

interface Props {
  orden: any
  plantillas: PlantillaWhatsapp[]
}

const EVENTOS_LABEL: Record<string, string> = {
  orden_recibida: 'Orden recibida',
  listo_retirar: 'Listo para retirar',
  entregado: 'Entregado',
  presupuesto_listo: 'Presupuesto listo',
}

export function OrdenWhatsApp({ orden, plantillas }: Props) {
  const [open, setOpen] = useState(false)
  const [eventoSeleccionado, setEventoSeleccionado] = useState('')
  const [mensajePreview, setMensajePreview] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleEvento = (evento: string) => {
    setEventoSeleccionado(evento)
    const plantilla = plantillas.find((p) => p.evento === evento)
    if (!plantilla) return

    const tenant = { nombre: orden.tenant_nombre ?? 'BluFix', id: orden.tenant_id, slug: '', logo_url: null, color_primario: '#2563EB', plan: 'pro' as const, activo: true, created_at: '', telefono: null, email: null, direccion: null, ciudad: null, pais: 'Venezuela', rif: null, fecha_vencimiento: null }
    const mensaje = generarMensajeOrden(evento as any, orden, tenant, plantilla.mensaje)
    setMensajePreview(mensaje)
  }

  const enviar = () => {
    if (!orden.cliente_telefono) {
      toast.error('El cliente no tiene teléfono registrado')
      return
    }
    abrirWhatsApp(orden.cliente_telefono, mensajePreview)

    startTransition(async () => {
      try {
        await registrarNotificacionWhatsapp({
          orden_id: orden.id,
          evento: eventoSeleccionado,
          mensaje_enviado: mensajePreview,
          telefono_destino: orden.cliente_telefono,
        })
      } catch {
        // Log failure is non-critical
      }
    })

    toast.success('WhatsApp abierto')
    setOpen(false)
  }

  if (!orden.cliente_telefono) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-600/90 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-display font-semibold text-foreground">Enviar WhatsApp</h3>
            <p className="text-sm text-muted-foreground">Para: {orden.cliente_nombre} ({orden.cliente_telefono})</p>

            <div>
              <label className="text-sm font-medium text-foreground">Tipo de mensaje</label>
              <select
                value={eventoSeleccionado}
                onChange={(e) => handleEvento(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Seleccionar...</option>
                {plantillas.map((p) => (
                  <option key={p.id} value={p.evento}>{EVENTOS_LABEL[p.evento] ?? p.evento}</option>
                ))}
              </select>
            </div>

            {mensajePreview && (
              <div>
                <label className="text-sm font-medium text-foreground">Vista previa</label>
                <textarea
                  value={mensajePreview}
                  onChange={(e) => setMensajePreview(e.target.value)}
                  rows={5}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={enviar}
                disabled={!mensajePreview || isPending}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-600/90 disabled:opacity-50 transition-colors"
              >
                Abrir WhatsApp
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
