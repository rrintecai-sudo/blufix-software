'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { agregarMovimientoCaja } from '@/app/actions/db'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  sucursales: { id: string; nombre: string }[]
  tasa: number
}

export function NuevoMovimientoForm({ sucursales, tasa }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    tipo: 'ingreso',
    categoria: 'reparacion',
    concepto: '',
    monto_usd: '',
    sucursal_id: sucursales[0]?.id ?? '',
    metodo_pago: '',
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.concepto || !form.monto_usd) { toast.error('Completa los campos obligatorios'); return }

    startTransition(async () => {
      try {
        await agregarMovimientoCaja({
          tipo: form.tipo,
          categoria: form.categoria,
          descripcion: form.concepto,
          monto_usd: parseFloat(form.monto_usd),
          tasa_bcv: tasa,
          sucursal_id: form.sucursal_id || null,
          metodo_pago: form.metodo_pago || null,
          orden_id: null,
        })
        toast.success('Movimiento registrado')
        setOpen(false)
        router.refresh()
      } catch (err: any) {
        toast.error('Error al registrar movimiento: ' + err.message)
      }
    })
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
        <Plus className="w-4 h-4" />
        Nuevo movimiento
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-display font-semibold text-foreground mb-4">Registrar movimiento</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-3">
                {['ingreso', 'egreso'].map((t) => (
                  <button key={t} type="button" onClick={() => setForm((p) => ({ ...p, tipo: t }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${form.tipo === t ? (t === 'ingreso' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30') : 'bg-secondary text-muted-foreground border border-border'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Categoría</label>
                <select value={form.categoria} onChange={set('categoria')} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="reparacion">Reparación</option>
                  <option value="venta_repuesto">Venta de repuesto</option>
                  <option value="gasto_operativo">Gasto operativo</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Concepto *</label>
                <input value={form.concepto} onChange={set('concepto')} required className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Monto USD *</label>
                <input type="number" step="0.01" min="0" value={form.monto_usd} onChange={set('monto_usd')} required className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                {form.monto_usd && <p className="text-xs text-muted-foreground mt-0.5">≈ Bs. {(parseFloat(form.monto_usd) * tasa).toFixed(2)}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isPending} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {isPending ? 'Guardando...' : 'Registrar'}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
