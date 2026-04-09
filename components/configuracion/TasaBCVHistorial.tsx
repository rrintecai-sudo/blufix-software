'use client'

import { useState } from 'react'
import { formatFecha, formatTasa } from '@/lib/utils'
import { TasaBCVWidget } from '@/components/shared/TasaBCVWidget'
import { tasaEstaDesactualizada } from '@/lib/tasa-bcv'
import type { TasaBCV } from '@/lib/types'

interface Props {
  tasa: TasaBCV | null
  historial: TasaBCV[]
}

export function TasaBCVHistorial({ tasa, historial }: Props) {
  const desactualizada = tasaEstaDesactualizada(tasa)

  return (
    <section className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h2 className="font-display font-semibold text-foreground">Tasa BCV</h2>

      <div className="flex items-center gap-4">
        <TasaBCVWidget tasa={tasa} desactualizada={desactualizada} />
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Historial últimas 2 semanas</p>
        <div className="space-y-1">
          {historial.map((t) => (
            <div key={t.id} className="flex justify-between items-center py-1.5 px-3 rounded-lg hover:bg-secondary/20 text-sm">
              <span className="text-muted-foreground">{formatFecha(t.fecha)}</span>
              <div className="flex items-center gap-3">
                <span className="font-medium text-foreground">Bs. {formatTasa(t.tasa)}</span>
                <span className="text-xs text-muted-foreground">{t.fuente}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
