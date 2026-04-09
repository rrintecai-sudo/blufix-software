'use client'

import { useEffect } from 'react'
import { generarReciboOrden } from '@/lib/pdf/recibo'
import { Download, Printer } from 'lucide-react'
import Link from 'next/link'

interface Props {
  orden: any
  costos: any[]
  tenant: any
}

export function ReciboViewer({ orden, costos, tenant }: Props) {
  const generar = () => {
    const doc = generarReciboOrden(orden, costos, tenant)
    return doc
  }

  const descargar = () => {
    const doc = generar()
    doc.save(`recibo-orden-${orden.numero_orden}.pdf`)
  }

  const imprimir = () => {
    const doc = generar()
    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank')
    if (win) { win.onload = () => win.print() }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-display font-bold text-2xl text-foreground">Recibo de reparación</h1>
        <p className="text-muted-foreground">Orden #{orden.numero_orden} — {orden.marca} {orden.modelo}</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={descargar}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Download className="w-5 h-5" />
          Descargar PDF
        </button>
        <button
          onClick={imprimir}
          className="flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
        >
          <Printer className="w-5 h-5" />
          Imprimir
        </button>
        <Link
          href={`/ordenes/${orden.id}`}
          className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          ← Volver
        </Link>
      </div>
    </div>
  )
}
