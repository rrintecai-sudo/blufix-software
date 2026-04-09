'use client'

import { useState, useTransition } from 'react'
import { crearSucursal, toggleSucursal } from '@/app/actions/db'
import { Plus, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Sucursal } from '@/lib/types'

interface Props {
  sucursales: Sucursal[]
}

export function ConfigSucursales({ sucursales: sucursalesInicial }: Props) {
  const [sucursales, setSucursales] = useState(sucursalesInicial)
  const [nueva, setNueva] = useState({ nombre: '', direccion: '', telefono: '' })
  const [agregando, setAgregando] = useState(false)
  const [isPending, startTransition] = useTransition()

  const agregar = () => {
    if (!nueva.nombre) { toast.error('El nombre es obligatorio'); return }
    startTransition(async () => {
      try {
        await crearSucursal(nueva)
        setNueva({ nombre: '', direccion: '', telefono: '' })
        setAgregando(false)
        toast.success('Sucursal agregada')
      } catch (e: any) {
        toast.error('Error al agregar: ' + e.message)
      }
    })
  }

  const toggle = (id: string, activo: boolean) => {
    startTransition(async () => {
      await toggleSucursal(id, !activo)
      setSucursales((p) => p.map((s) => s.id === id ? { ...s, activo: !activo } : s))
      toast.success(!activo ? 'Sucursal activada' : 'Sucursal desactivada')
    })
  }

  return (
    <section className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-foreground">Sucursales</h2>
        <button onClick={() => setAgregando(!agregando)} className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Agregar
        </button>
      </div>

      {agregando && (
        <div className="grid grid-cols-3 gap-2 p-3 bg-secondary/30 rounded-lg">
          <input placeholder="Nombre *" value={nueva.nombre} onChange={(e) => setNueva((p) => ({ ...p, nombre: e.target.value }))} className="px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          <input placeholder="Dirección" value={nueva.direccion} onChange={(e) => setNueva((p) => ({ ...p, direccion: e.target.value }))} className="px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          <input placeholder="Teléfono" value={nueva.telefono} onChange={(e) => setNueva((p) => ({ ...p, telefono: e.target.value }))} className="px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          <div className="col-span-3 flex gap-2">
            <button onClick={agregar} disabled={isPending} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">Guardar</button>
            <button onClick={() => setAgregando(false)} className="px-3 py-1.5 bg-secondary text-foreground rounded-lg text-xs font-medium transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sucursales.map((s) => (
          <div key={s.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/20">
            <div>
              <span className="text-sm font-medium text-foreground">{s.nombre}</span>
              {s.direccion && <span className="text-xs text-muted-foreground ml-2">{s.direccion}</span>}
            </div>
            <button onClick={() => toggle(s.id, s.activo)} disabled={isPending} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-colors ${s.activo ? 'bg-green-500/20 text-green-400' : 'bg-secondary text-muted-foreground'}`}>
              {s.activo ? <><Check className="w-3 h-3" /> Activa</> : <><X className="w-3 h-3" /> Inactiva</>}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
