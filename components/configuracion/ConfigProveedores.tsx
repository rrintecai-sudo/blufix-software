'use client'

import { useState, useTransition } from 'react'
import { crearProveedor } from '@/app/actions/db'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Proveedor } from '@/lib/types'

export function ConfigProveedores({ proveedores: proveedoresInicial }: { proveedores: Proveedor[] }) {
  const [proveedores, setProveedores] = useState(proveedoresInicial)
  const [nuevo, setNuevo] = useState({ nombre: '', costo_cero: false })
  const [agregando, setAgregando] = useState(false)
  const [isPending, startTransition] = useTransition()

  const agregar = () => {
    if (!nuevo.nombre) { toast.error('Nombre obligatorio'); return }
    startTransition(async () => {
      try {
        await crearProveedor(nuevo)
        setNuevo({ nombre: '', costo_cero: false })
        setAgregando(false)
        toast.success('Proveedor agregado')
      } catch {
        toast.error('Error al agregar')
      }
    })
  }

  return (
    <section className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-foreground">Proveedores</h2>
        <button onClick={() => setAgregando(!agregando)} className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
          <Plus className="w-3.5 h-3.5" />Agregar
        </button>
      </div>

      {agregando && (
        <div className="grid grid-cols-2 gap-2 p-3 bg-secondary/30 rounded-lg">
          <input placeholder="Nombre *" value={nuevo.nombre} onChange={(e) => setNuevo((p) => ({ ...p, nombre: e.target.value }))} className="px-2.5 py-1.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          <label className="flex items-center gap-2 text-sm text-foreground col-span-2 cursor-pointer">
            <input type="checkbox" checked={nuevo.costo_cero} onChange={(e) => setNuevo((p) => ({ ...p, costo_cero: e.target.checked }))} className="rounded" />
            Proveedor de costo cero (repuestos gratis)
          </label>
          <div className="col-span-2 flex gap-2">
            <button onClick={agregar} disabled={isPending} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium disabled:opacity-50 transition-colors">Guardar</button>
            <button onClick={() => setAgregando(false)} className="px-3 py-1.5 bg-secondary text-foreground rounded-lg text-xs font-medium transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      <div className="divide-y divide-border">
        {proveedores.map((p) => (
          <div key={p.id} className="flex items-center justify-between py-2.5">
            <div>
              <span className="text-sm font-medium text-foreground">{p.nombre}</span>
              {p.costo_cero && <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Costo $0</span>}
            </div>
            <span className={`text-xs ${p.activo ? 'text-green-400' : 'text-muted-foreground'}`}>
              {p.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
