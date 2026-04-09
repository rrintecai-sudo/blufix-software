'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { agregarPieza } from '@/app/actions/db'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  proveedores: { id: string; nombre: string }[]
  sucursales: { id: string; nombre: string }[]
}

const CATEGORIAS = ['pantalla', 'bateria', 'flex', 'conector', 'camara', 'botones', 'carcasa', 'otro']

export function AgregarPiezaForm({ proveedores, sucursales }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    referencia: '',
    categoria: 'otro',
    marca: '',
    modelo_compatible: '',
    proveedor_id: '',
    sucursal_id: sucursales[0]?.id ?? '',
    stock_actual: '0',
    stock_minimo: '2',
    costo_usd: '0',
    precio_venta_usd: '0',
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre) { toast.error('El nombre es obligatorio'); return }

    startTransition(async () => {
      try {
        await agregarPieza({
          nombre: form.nombre,
          referencia: form.referencia || null,
          categoria: form.categoria,
          marca: form.marca || null,
          modelo_compatible: form.modelo_compatible || null,
          proveedor_id: form.proveedor_id || null,
          sucursal_id: form.sucursal_id || null,
          stock_actual: parseInt(form.stock_actual),
          stock_minimo: parseInt(form.stock_minimo),
          costo_usd: parseFloat(form.costo_usd),
          precio_venta_usd: parseFloat(form.precio_venta_usd),
        })
        toast.success('Pieza agregada al inventario')
        setOpen(false)
        router.refresh()
      } catch (err: any) {
        toast.error('Error al agregar pieza: ' + err.message)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Agregar pieza
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="font-display font-semibold text-foreground mb-4">Agregar pieza</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-foreground">Nombre *</label>
                  <input value={form.nombre} onChange={set('nombre')} required className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Categoría</label>
                  <select value={form.categoria} onChange={set('categoria')} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Referencia</label>
                  <input value={form.referencia} onChange={set('referencia')} placeholder="Código interno" className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Marca</label>
                  <input value={form.marca} onChange={set('marca')} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Modelos compatibles</label>
                  <input value={form.modelo_compatible} onChange={set('modelo_compatible')} placeholder="Samsung A25, A26..." className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Stock actual</label>
                  <input type="number" min="0" value={form.stock_actual} onChange={set('stock_actual')} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Stock mínimo</label>
                  <input type="number" min="0" value={form.stock_minimo} onChange={set('stock_minimo')} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Costo USD</label>
                  <input type="number" step="0.01" min="0" value={form.costo_usd} onChange={set('costo_usd')} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Precio venta USD</label>
                  <input type="number" step="0.01" min="0" value={form.precio_venta_usd} onChange={set('precio_venta_usd')} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Proveedor</label>
                  <select value={form.proveedor_id} onChange={set('proveedor_id')} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Sin proveedor</option>
                    {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Sucursal</label>
                  <select value={form.sucursal_id} onChange={set('sucursal_id')} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isPending} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {isPending ? 'Guardando...' : 'Guardar pieza'}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
