'use client'

import { useState, useTransition } from 'react'
import { crearTecnico, toggleTecnico } from '@/app/actions/db'
import { Plus, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Tecnico } from '@/lib/types'

export function ConfigTecnicos({ tecnicos: tecnicosInicial }: { tecnicos: Tecnico[] }) {
  const [tecnicos, setTecnicos] = useState(tecnicosInicial)
  const [nuevo, setNuevo] = useState({ nombre: '', cedula: '', telefono: '', porcentaje_comision: '50', metodo_pago: '' })
  const [agregando, setAgregando] = useState(false)
  const [isPending, startTransition] = useTransition()

  const agregar = () => {
    if (!nuevo.nombre) { toast.error('El nombre es obligatorio'); return }
    startTransition(async () => {
      try {
        await crearTecnico({
          nombre: nuevo.nombre,
          cedula: nuevo.cedula || null,
          telefono: nuevo.telefono || null,
          porcentaje_comision: parseFloat(nuevo.porcentaje_comision),
          metodo_pago: nuevo.metodo_pago || null,
        })
        setNuevo({ nombre: '', cedula: '', telefono: '', porcentaje_comision: '50', metodo_pago: '' })
        setAgregando(false)
        toast.success('Técnico agregado')
      } catch (e: any) {
        toast.error('Error: ' + e.message)
      }
    })
  }

  const toggle = (id: string, activo: boolean) => {
    startTransition(async () => {
      await toggleTecnico(id, !activo)
      setTecnicos((p) => p.map((t) => t.id === id ? { ...t, activo: !activo } : t))
    })
  }

  return (
    <section className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-foreground">Técnicos</h2>
        <button onClick={() => setAgregando(!agregando)} className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
          <Plus className="w-3.5 h-3.5" />Agregar
        </button>
      </div>

      {agregando && (
        <div className="grid grid-cols-2 gap-2 p-3 bg-secondary/30 rounded-lg">
          {[['nombre','Nombre *'],['cedula','Cédula'],['telefono','Teléfono'],['porcentaje_comision','% Comisión'],['metodo_pago','Método de pago']].map(([k, label]) => (
            <div key={k}>
              <label className="text-xs text-muted-foreground">{label}</label>
              <input value={(nuevo as any)[k]} onChange={(e) => setNuevo((p) => ({ ...p, [k]: e.target.value }))} type={k === 'porcentaje_comision' ? 'number' : 'text'} className="mt-0.5 w-full px-2.5 py-1.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          ))}
          <div className="col-span-2 flex gap-2 mt-1">
            <button onClick={agregar} disabled={isPending} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium disabled:opacity-50 transition-colors">Guardar</button>
            <button onClick={() => setAgregando(false)} className="px-3 py-1.5 bg-secondary text-foreground rounded-lg text-xs font-medium transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      <div className="divide-y divide-border">
        {tecnicos.map((t) => (
          <div key={t.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-foreground">{t.nombre}</p>
              <p className="text-xs text-muted-foreground">{t.porcentaje_comision}% comisión · {t.metodo_pago?.replace('_', ' ') ?? 'Sin método'}</p>
            </div>
            <button onClick={() => toggle(t.id, t.activo)} disabled={isPending} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${t.activo ? 'bg-green-500/20 text-green-400' : 'bg-secondary text-muted-foreground'}`}>
              {t.activo ? <><Check className="w-3 h-3" />Activo</> : <><X className="w-3 h-3" />Inactivo</>}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
