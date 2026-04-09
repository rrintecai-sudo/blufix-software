import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatFecha, formatUSD, formatBs, formatTasa } from '@/lib/utils'

export function generarReporteTecnico(
  tecnico: any,
  ordenes: any[],
  periodoDesde: string,
  periodoHasta: string,
  tasaPago: number
) {
  const doc = new jsPDF({ format: 'letter', unit: 'mm' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 15
  const azul: [number, number, number] = [37, 99, 235]

  // Header
  doc.setFillColor(...azul)
  doc.rect(0, 0, pageW, 22, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text('REPORTE DE COMISIONES', margin, 10)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Técnico: ${tecnico.nombre}   ·   ${formatFecha(periodoDesde)} — ${formatFecha(periodoHasta)}`, margin, 17)

  let y = 30

  // Tabla de órdenes
  autoTable(doc, {
    startY: y,
    head: [['#', 'Equipo', 'Precio USD', 'Costo USD', 'Ganancia USD', `Comisión (${tecnico.porcentaje_comision}%)`, 'Comisión Bs.', 'Tasa']],
    body: ordenes.map((o) => [
      `#${o.numero_orden}`,
      `${o.marca} ${o.modelo}`,
      formatUSD(o.precio_cobrado_usd),
      formatUSD(o.costo_total_usd),
      formatUSD(o.ganancia_usd),
      formatUSD(o.comision_tecnico_usd),
      formatBs(o.comision_tecnico_bs),
      formatTasa(o.tasa_evento),
    ]),
    theme: 'striped',
    headStyles: { fillColor: azul, textColor: 255, fontSize: 7, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
    },
    margin: { left: margin, right: margin },
  })

  y = (doc as any).lastAutoTable.finalY + 8

  // Bloque de liquidación
  const totalComisionUSD = ordenes.reduce((s, o) => s + (o.comision_tecnico_usd ?? 0), 0)
  const totalPagarBs = totalComisionUSD * tasaPago

  doc.setFillColor(241, 245, 249)
  doc.roundedRect(margin, y, pageW - margin * 2, 30, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  doc.text('LIQUIDACIÓN', margin + 5, y + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Total comisión USD: ${formatUSD(totalComisionUSD)}`, margin + 5, y + 15)
  doc.text(`Tasa BCV del pago: Bs. ${formatTasa(tasaPago)}`, margin + 5, y + 22)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...azul)
  doc.text(`TOTAL A PAGAR: ${formatBs(totalPagarBs)}`, pageW - margin, y + 18, { align: 'right' })

  if (tecnico.metodo_pago) {
    y += 32
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text(`Método de pago: ${tecnico.metodo_pago.replace('_', ' ')}${tecnico.datos_pago ? ` — ${tecnico.datos_pago}` : ''}`, margin, y + 5)
  }

  // Firma
  y += 20
  doc.line(margin, y + 14, margin + 60, y + 14)
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text('Firma del técnico', margin + 30, y + 19, { align: 'center' })

  doc.setFontSize(7)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-VE')}`, pageW - margin, y + 25, { align: 'right' })

  return doc
}
