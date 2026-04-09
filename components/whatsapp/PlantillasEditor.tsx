'use client'

import { useState, useTransition } from 'react'
import { actualizarPlantillaWhatsapp } from '@/app/actions/db'
import { toast } from 'sonner'
import type { PlantillaWhatsapp } from '@/lib/types'

const EVENTOS_LABEL: Record<string, string> = {
  orden_recibida: 'Orden recibida',
  listo_retirar: 'Listo para retirar',
  entregado: 'Entregado',
  presupuesto_listo: 'Presupuesto listo',
}

interface Props {
  plantillas: PlantillaWhatsapp[]
}

export function PlantillasEditor({ plantillas: plantillasInicial }: Props) {
  const [plantillas, setPlantillas] = useState(plantillasInicial)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [mensajeEdit, setMensajeEdit] = useState('')
  const [isPending, startTransition] = useTransition()

  const iniciarEdicion = (p: PlantillaWhatsapp) => {
    setEditandoId(p.id)
    setMensajeEdit(p.mensaje)
  }

  const guardar = (id: string) => {
    startTransition(async () => {
      try {
        await actualizarPlantillaWhatsapp(id, mensajeEdit)
        setPlantillas((p) => p.map((pl) => pl.id === id ? { ...pl, mensaje: mensajeEdit } : pl))
        toast.success('Plantilla actualizada')
        setEditandoId(null)
      } catch {
        toast.error('Error al guardar plantilla')
      }
    })
  }

  return (
    <div className="space-y-3">
      {plantillas.map((p) => (
        <div key={p.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">{EVENTOS_LABEL[p.evento] ?? p.evento}</span>
            {editandoId !== p.id && (
              <button onClick={() => iniciarEdicion(p)} className="text-xs text-primary hover:underline">Editar</button>
            )}
          </div>
          {editandoId === p.id ? (
            <div className="space-y-2">
              <textarea
                value={mensajeEdit}
                onChange={(e) => setMensajeEdit(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => guardar(p.id)} disabled={isPending} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {isPending ? 'Guardando...' : 'Guardar'}
                </button>
                <button onClick={() => setEditandoId(null)} className="px-3 py-1.5 bg-secondary text-foreground rounded-lg text-xs font-medium transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{p.mensaje}</p>
          )}
        </div>
      ))}
    </div>
  )
}
