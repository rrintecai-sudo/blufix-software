'use client'

import { useState, useTransition } from 'react'
import { agregarCostoOrden, eliminarCostoOrden } from '@/app/actions/db'
import { formatUSD } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Costo {
  id: string
  concepto: string
  costo_usd: number
  proveedor_id: string | null
  inventario_id: string | null
  proveedores?: { nombre: string } | null
  inventario?: { nombre: string } | null
}

interface Props {
  ordenId: string
  costos: Costo[]
  proveedores: { id: string; nombre: string; costo_cero: boolean }[]
  inventario: { id: string; nombre: string; stock_actual: number }[]
}

export function OrdenCostos({ ordenId, costos: costosInicial, proveedores, inventario }: Props) {
  const [costos, setCostos] = useState(costosInicial)
  const [isPending, startTransition] = useTransition()
  const [nuevaLinea, setNuevaLinea] = useState({
    concepto: '',
    proveedor_id: '',
    inventario_id: '',
    costo_usd: '',
  })

  const total = costos.reduce((s, c) => s + (c.costo_usd ?? 0), 0)

  const handleProveedorChange = (proveedorId: string) => {
    const prov = proveedores.find((p) => p.id === proveedorId)
    setNuevaLinea((p) => ({
      ...p,
      proveedor_id: proveedorId,
      costo_usd: prov?.costo_cero ? '0' : p.costo_usd,
    }))
  }

  const handleInventarioChange = (invId: string) => {
    const item = inventario.find((i) => i.id === invId)
    setNuevaLinea((p) => ({
      ...p,
      inventario_id: invId,
      concepto: item?.nombre ?? p.concepto,
    }))
  }

  const agregarCosto = () => {
    if (!nuevaLinea.concepto || !nuevaLinea.costo_usd) {
      toast.error('Concepto y costo son obligatorios')
      return
    }
    startTransition(async () => {
      try {
        const data = await agregarCostoOrden(ordenId, {
          concepto: nuevaLinea.concepto,
          proveedor_id: nuevaLinea.proveedor_id || null,
          inventario_id: nuevaLinea.inventario_id || null,
          costo_usd: parseFloat(nuevaLinea.costo_usd),
        })
        setCostos((p) => [...p, data as Costo])
        setNuevaLinea({ concepto: '', proveedor_id: '', inventario_id: '', costo_usd: '' })
        toast.success('Costo agregado')
      } catch (e: any) {
        toast.error('Error al agregar costo: ' + e.message)
      }
    })
  }

  const eliminarCosto = (costoId: string) => {
    startTransition(async () => {
      try {
        await eliminarCostoOrden(costoId)
        setCostos((p) => p.filter((c) => c.id !== costoId))
        toast.success('Costo eliminado')
      } catch {
        toast.error('Error al eliminar')
      }
    })
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-foreground">Costos de reparación</h2>
        <span className="text-sm font-medium text-muted-foreground">Total: {formatUSD(total)}</span>
      </div>

      {costos.length > 0 && (
        <div className="space-y-1.5">
          {costos.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg hover:bg-secondary/30 group">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{c.concepto}</p>
                {c.proveedores?.nombre && (
                  <p className="text-xs text-muted-foreground">{c.proveedores.nombre}</p>
                )}
              </div>
              <span className="text-sm font-medium text-foreground shrink-0">{formatUSD(c.costo_usd)}</span>
              <button
                onClick={() => eliminarCosto(c.id)}
                disabled={isPending}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition-all disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">{formatUSD(total)}</span>
          </div>
        </div>
      )}

      <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Agregar costo</p>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={nuevaLinea.inventario_id}
            onChange={(e) => handleInventarioChange(e.target.value)}
            className="px-2.5 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring col-span-2"
          >
            <option value="">Desde inventario (opcional)</option>
            {inventario.map((i) => (
              <option key={i.id} value={i.id}>{i.nombre} (stock: {i.stock_actual})</option>
            ))}
          </select>
          <input
            placeholder="Concepto *"
            value={nuevaLinea.concepto}
            onChange={(e) => setNuevaLinea((p) => ({ ...p, concepto: e.target.value }))}
            className="px-2.5 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Costo USD *"
            value={nuevaLinea.costo_usd}
            onChange={(e) => setNuevaLinea((p) => ({ ...p, costo_usd: e.target.value }))}
            className="px-2.5 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <select
            value={nuevaLinea.proveedor_id}
            onChange={(e) => handleProveedorChange(e.target.value)}
            className="px-2.5 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Proveedor (opcional)</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}{p.costo_cero ? ' (costo $0)' : ''}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={agregarCosto}
            disabled={isPending}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {isPending ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}
