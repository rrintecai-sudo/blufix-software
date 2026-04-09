'use client'

import { useState, useTransition } from 'react'
import { guardarFacturacion } from '@/app/actions/db'
import { formatUSD, formatBs, formatTasa, formatFecha } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  orden: any
}

export function OrdenFacturacion({ orden }: Props) {
  const [editando, setEditando] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    precio_cobrado_usd: String(orden.precio_cobrado_usd ?? ''),
    metodo_pago: orden.metodo_pago ?? '',
    numero_factura: orden.numero_factura ?? '',
    motivo_ajuste_precio: orden.motivo_ajuste_precio ?? '',
  })

  const yaEntregado = orden.estado === 'entregado'

  const guardar = () => {
    if (!form.precio_cobrado_usd) {
      toast.error('El precio es obligatorio')
      return
    }
    startTransition(async () => {
      try {
        await guardarFacturacion(orden.id, {
          precio_cobrado_usd: parseFloat(form.precio_cobrado_usd),
          metodo_pago: form.metodo_pago || null,
          numero_factura: form.numero_factura || null,
          motivo_ajuste_precio: form.motivo_ajuste_precio || null,
        })
        toast.success('Facturación actualizada')
        setEditando(false)
        window.location.reload()
      } catch (e: any) {
        toast.error('Error al guardar: ' + e.message)
      }
    })
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-foreground">Facturación final</h2>
        {!yaEntregado && !editando && (
          <button
            onClick={() => setEditando(true)}
            className="text-sm text-primary hover:underline"
          >
            {orden.precio_cobrado_usd ? 'Editar' : 'Registrar pago'}
          </button>
        )}
      </div>

      {editando ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">Precio cobrado (USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.precio_cobrado_usd}
                onChange={(e) => setForm((p) => ({ ...p, precio_cobrado_usd: e.target.value }))}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Método de pago</label>
              <select
                value={form.metodo_pago}
                onChange={(e) => setForm((p) => ({ ...p, metodo_pago: e.target.value }))}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Seleccionar...</option>
                <option value="pago_movil">Pago Móvil</option>
                <option value="zelle">Zelle</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="cashea">Cashea</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">N° Factura</label>
              <input
                value={form.numero_factura}
                onChange={(e) => setForm((p) => ({ ...p, numero_factura: e.target.value }))}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Motivo de ajuste</label>
              <input
                value={form.motivo_ajuste_precio}
                onChange={(e) => setForm((p) => ({ ...p, motivo_ajuste_precio: e.target.value }))}
                placeholder="Si difiere del precio inicial..."
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={guardar}
              disabled={isPending}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => setEditando(false)}
              className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : orden.precio_cobrado_usd ? (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Precio cobrado</span>
            <div className="text-right">
              <div className="font-semibold text-foreground">{formatUSD(orden.precio_cobrado_usd)}</div>
              <div className="text-xs text-muted-foreground">{formatBs(orden.precio_cobrado_usd * (orden.tasa_evento ?? 1))}</div>
            </div>
          </div>
          {orden.metodo_pago && <div className="flex justify-between"><span className="text-muted-foreground">Método</span><span className="text-foreground capitalize">{orden.metodo_pago.replace('_', ' ')}</span></div>}
          {orden.numero_factura && <div className="flex justify-between"><span className="text-muted-foreground">Factura</span><span className="text-foreground">{orden.numero_factura}</span></div>}
          {orden.fecha_facturacion && <div className="flex justify-between"><span className="text-muted-foreground">Fecha</span><span className="text-foreground">{formatFecha(orden.fecha_facturacion)}</span></div>}
          {orden.tasa_evento && <div className="flex justify-between"><span className="text-muted-foreground">Tasa BCV</span><span className="text-foreground">Bs. {formatTasa(orden.tasa_evento)}</span></div>}
          {orden.motivo_ajuste_precio && <div className="flex justify-between"><span className="text-muted-foreground">Ajuste</span><span className="text-foreground">{orden.motivo_ajuste_precio}</span></div>}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Sin facturación registrada aún.</p>
      )}
    </div>
  )
}
