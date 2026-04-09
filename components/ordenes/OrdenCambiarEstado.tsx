'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cambiarEstadoOrden } from '@/app/actions/db'
import { ESTADO_ORDEN_CONFIG, ESTADOS_ORDEN_FLOW } from '@/lib/types'
import type { EstadoOrden } from '@/lib/types'
import { ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  orden: any
  tecnicos: { id: string; nombre: string }[]
}

export function OrdenCambiarEstado({ orden, tecnicos }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [notas, setNotas] = useState('')
  const [garantiaDias, setGarantiaDias] = useState(String(orden.garantia_dias ?? 7))

  const estadoActual: EstadoOrden = orden.estado
  const esEntregado = estadoActual === 'entregado'
  const esCancelado = estadoActual === 'cancelado'

  const estadosSiguientes: EstadoOrden[] = [
    ...ESTADOS_ORDEN_FLOW.filter((e) => e !== estadoActual && e !== 'entregado'),
    'entregado',
    'cancelado',
  ].filter((e) => {
    if (e === 'cancelado') return true
    const idxActual = ESTADOS_ORDEN_FLOW.indexOf(estadoActual)
    const idxTarget = ESTADOS_ORDEN_FLOW.indexOf(e)
    return idxTarget > idxActual
  }) as EstadoOrden[]

  const cambiarEstado = (nuevoEstado: EstadoOrden) => {
    if (nuevoEstado === 'entregado' && !orden.precio_cobrado_usd) {
      toast.error('Debes registrar el precio cobrado antes de entregar')
      setOpen(false)
      return
    }

    startTransition(async () => {
      try {
        const ahora = new Date().toISOString()
        const extra: any = {}
        if (nuevoEstado === 'entregado') {
          extra.fecha_entrega = ahora
          extra.garantia_dias = parseInt(garantiaDias)
          extra.garantia_vence = new Date(Date.now() + parseInt(garantiaDias) * 24 * 60 * 60 * 1000).toISOString()
        }

        await cambiarEstadoOrden(orden.id, nuevoEstado, estadoActual, extra)
        toast.success(`Estado cambiado a: ${ESTADO_ORDEN_CONFIG[nuevoEstado].label}`)
        setOpen(false)
        router.refresh()
      } catch (e: any) {
        toast.error('Error al cambiar estado: ' + e.message)
      }
    })
  }

  if (esEntregado || esCancelado) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
        Cambiar estado
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-display font-semibold text-foreground">Cambiar estado</h3>
            <p className="text-sm text-muted-foreground">Estado actual: <strong className="text-foreground">{ESTADO_ORDEN_CONFIG[estadoActual]?.label}</strong></p>

            <div>
              <label className="text-sm font-medium text-foreground">Notas (opcional)</label>
              <input
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Observaciones sobre el cambio..."
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              {estadosSiguientes.map((estado) => {
                const config = ESTADO_ORDEN_CONFIG[estado]
                const esEntrega = estado === 'entregado'
                return (
                  <div key={estado}>
                    {esEntrega && (
                      <div className="mb-2">
                        <label className="text-sm font-medium text-foreground">Días de garantía</label>
                        <input
                          type="number"
                          min="0"
                          value={garantiaDias}
                          onChange={(e) => setGarantiaDias(e.target.value)}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => cambiarEstado(estado)}
                      disabled={isPending}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors border disabled:opacity-50 ${config.bg} ${config.color} border-current/20 hover:opacity-80`}
                    >
                      <ChevronRight className="w-4 h-4" />
                      {config.label}
                    </button>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
