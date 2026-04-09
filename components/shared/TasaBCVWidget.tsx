'use client'

import { useState } from 'react'
import { RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { formatTasa, formatFecha } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { TasaBCV } from '@/lib/types'

interface TasaBCVWidgetProps {
  tasa: TasaBCV | null
  desactualizada: boolean
}

export function TasaBCVWidget({ tasa, desactualizada }: TasaBCVWidgetProps) {
  const [loading, setLoading] = useState(false)
  const [tasaActual, setTasaActual] = useState(tasa)
  const [estaDesactualizada, setEstaDesactualizada] = useState(desactualizada)

  const actualizarTasa = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tasa-bcv/actualizar', { method: 'POST' })
      const data = await res.json()
      if (data.tasa) {
        setTasaActual((prev) => prev ? { ...prev, tasa: data.tasa } : prev)
        setEstaDesactualizada(false)
        toast.success(`Tasa actualizada: Bs. ${formatTasa(data.tasa)}`)
      } else {
        toast.error('No se pudo actualizar la tasa')
      }
    } catch {
      toast.error('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {estaDesactualizada ? (
          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
        )}
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">BCV</span>
            <span className={cn(
              'font-display font-bold text-lg',
              estaDesactualizada ? 'text-yellow-400' : 'text-foreground'
            )}>
              Bs. {tasaActual ? formatTasa(tasaActual.tasa) : '—'}
            </span>
          </div>
          {tasaActual && (
            <p className="text-xs text-muted-foreground leading-none">
              {formatFecha(tasaActual.fecha)}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={actualizarTasa}
        disabled={loading}
        title="Actualizar tasa BCV"
        className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
      </button>
    </div>
  )
}
