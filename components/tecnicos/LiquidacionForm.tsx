'use client'

import { useState, useTransition } from 'react'
import { crearLiquidacion } from '@/app/actions/db'
import { formatUSD, formatBs, formatTasa } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  tecnico: { id: string; nombre: string; metodo_pago: string | null; datos_pago?: string | null }
  periodoDesde: string
  periodoHasta: string
  totalOrdenes?: number
  totalIngresosUSD?: number
  totalComisionUSD: number
  tasaPago: number
}

export function LiquidacionForm({ tecnico, periodoDesde, periodoHasta, totalOrdenes = 0, totalIngresosUSD = 0, totalComisionUSD, tasaPago }: Props) {
  const [isPending, startTransition] = useTransition()
  const [notas, setNotas] = useState('')
  const totalBs = totalComisionUSD * tasaPago

  const marcarPagado = () => {
    startTransition(async () => {
      try {
        await crearLiquidacion({
          tecnico_id: tecnico.id,
          fecha_inicio: periodoDesde,
          fecha_fin: periodoHasta,
          total_ordenes: totalOrdenes,
          total_ingresos_usd: totalIngresosUSD,
          total_comision_usd: totalComisionUSD,
          tasa_pago: tasaPago,
          total_comision_bs: totalBs,
          notas: notas || null,
        })
        toast.success(`Liquidación de ${tecnico.nombre} registrada`)
      } catch {
        toast.error('Error al registrar liquidación')
      }
    })
  }

  return (
    <div className="bg-card border border-primary/30 rounded-xl p-5 space-y-4">
      <h2 className="font-display font-semibold text-foreground">Liquidación</h2>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center bg-secondary/30 rounded-lg p-3">
          <div className="font-display font-bold text-lg text-foreground">{formatUSD(totalComisionUSD)}</div>
          <div className="text-xs text-muted-foreground">Comisión USD</div>
        </div>
        <div className="text-center bg-secondary/30 rounded-lg p-3">
          <div className="font-display font-bold text-lg text-muted-foreground">Bs. {formatTasa(tasaPago)}</div>
          <div className="text-xs text-muted-foreground">Tasa del día</div>
        </div>
        <div className="text-center bg-primary/10 border border-primary/20 rounded-lg p-3">
          <div className="font-display font-bold text-lg text-primary">{formatBs(totalBs)}</div>
          <div className="text-xs text-muted-foreground">A pagar en Bs.</div>
        </div>
      </div>

      {tecnico.metodo_pago && (
        <div className="text-sm text-muted-foreground">
          Método: <span className="text-foreground capitalize">{tecnico.metodo_pago.replace('_', ' ')}</span>
          {tecnico.datos_pago && <span className="ml-2">— {tecnico.datos_pago}</span>}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-foreground">Notas</label>
        <input
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Referencia de transferencia, observaciones..."
          className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <button
        onClick={marcarPagado}
        disabled={isPending}
        className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Registrando...' : 'Marcar como pagado'}
      </button>
    </div>
  )
}
