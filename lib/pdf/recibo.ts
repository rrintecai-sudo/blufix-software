import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatFecha, formatFechaHora, formatUSD, formatBs, formatTasa, usdToBs } from '@/lib/utils'

export function generarReciboOrden(orden: any, costos: any[], tenant: any) {
  const doc = new jsPDF({ format: 'letter', unit: 'mm' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 15

  // Colores
  const azul: [number, number, number] = [37, 99, 235]
  const gris: [number, number, number] = [100, 116, 139]
  const negro: [number, number, number] = [15, 23, 42]
  const grisClaro: [number, number, number] = [241, 245, 249]

  // Header
  doc.setFillColor(...azul)
  doc.rect(0, 0, pageW, 28, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text(tenant.nombre ?? 'BluFix', margin, 12)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  if (tenant.direccion) doc.text(tenant.direccion, margin, 18)
  if (tenant.telefono) doc.text(`Tel: ${tenant.telefono}`, margin, 23)

  // Número de orden
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(`RECIBO #${orden.numero_orden}`, pageW - margin, 12, { align: 'right' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(formatFechaHora(orden.created_at), pageW - margin, 18, { align: 'right' })

  let y = 36

  // Datos cliente | Datos equipo en dos columnas
  const colW = (pageW - margin * 2 - 5) / 2

  // Cliente
  doc.setFillColor(...grisClaro)
  doc.roundedRect(margin, y, colW, 32, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...gris)
  doc.text('CLIENTE', margin + 3, y + 6)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...negro)
  doc.text(orden.cliente_nombre ?? '—', margin + 3, y + 13)
  doc.setFontSize(8)
  doc.setTextColor(...gris)
  doc.text(`Tel: ${orden.cliente_telefono ?? '—'}`, margin + 3, y + 20)
  if (orden.tecnico_nombre) doc.text(`Técnico: ${orden.tecnico_nombre}`, margin + 3, y + 26)

  // Equipo
  const col2X = margin + colW + 5
  doc.setFillColor(...grisClaro)
  doc.roundedRect(col2X, y, colW, 32, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...gris)
  doc.text('EQUIPO', col2X + 3, y + 6)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...negro)
  doc.text(`${orden.marca} ${orden.modelo}`, col2X + 3, y + 13)
  doc.setFontSize(8)
  doc.setTextColor(...gris)
  if (orden.imei) doc.text(`IMEI: ${orden.imei}`, col2X + 3, y + 20)
  if (orden.color) doc.text(`Color: ${orden.color}`, col2X + 3, y + 26)

  y += 38

  // Falla y diagnóstico
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...gris)
  doc.text('FALLA REPORTADA:', margin, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...negro)
  const fallaLines = doc.splitTextToSize(orden.falla_reportada ?? '—', pageW - margin * 2 - 35)
  doc.text(fallaLines, margin + 36, y + 5)
  y += 6 + fallaLines.length * 4

  if (orden.diagnostico) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...gris)
    doc.text('DIAGNÓSTICO:', margin, y + 5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...negro)
    const diagLines = doc.splitTextToSize(orden.diagnostico, pageW - margin * 2 - 32)
    doc.text(diagLines, margin + 30, y + 5)
    y += 6 + diagLines.length * 4
  }

  y += 4

  // Checklist
  const checks = [
    { label: 'Enciende', val: orden.enciende },
    { label: 'Pantalla', val: orden.pantalla_ok },
    { label: 'Corneta', val: orden.corneta_ok },
    { label: 'Pin carga', val: orden.pin_carga_ok },
    { label: 'Cámara', val: orden.camara_ok },
    { label: 'Botones', val: orden.botones_ok },
  ]
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...gris)
  doc.text('ESTADO DEL EQUIPO AL RECIBIR:', margin, y + 4)
  y += 7

  const checkW = (pageW - margin * 2) / checks.length
  checks.forEach((c, i) => {
    const x = margin + i * checkW
    doc.setFillColor(c.val === true ? 220 : c.val === false ? 254 : 241, c.val === true ? 252 : c.val === false ? 226 : 245, c.val === true ? 231 : c.val === false ? 226 : 249)
    doc.roundedRect(x, y, checkW - 2, 10, 1, 1, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...negro)
    doc.text(`${c.label}: ${c.val === true ? 'Sí' : c.val === false ? 'No' : '?'}`, x + 2, y + 6.5)
  })
  y += 14

  // Costos (si hay)
  if (costos.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Concepto', 'Costo USD']],
      body: costos.map((c) => [c.concepto, formatUSD(c.costo_usd)]),
      theme: 'striped',
      headStyles: { fillColor: azul, textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: negro },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: margin, right: margin },
    })
    y = (doc as any).lastAutoTable.finalY + 4
  }

  // Totales
  const totalCosto = costos.reduce((s, c) => s + (c.costo_usd ?? 0), 0)
  const precio = orden.precio_cobrado_usd ?? 0
  const tasa = orden.tasa_evento ?? 1

  doc.setFillColor(...grisClaro)
  doc.roundedRect(margin, y, pageW - margin * 2, 28, 2, 2, 'F')

  const labelX = pageW - margin - 70
  const valX = pageW - margin

  const rows = [
    { label: 'Precio cobrado:', val: formatUSD(precio) },
    { label: `Bs. (tasa ${formatTasa(tasa)}):`, val: formatBs(precio * tasa) },
  ]

  rows.forEach((r, i) => {
    doc.setFont('helvetica', i === 0 ? 'bold' : 'normal')
    doc.setFontSize(i === 0 ? 11 : 9)
    doc.setTextColor(...(i === 0 ? azul : gris))
    doc.text(r.label, labelX, y + 9 + i * 10)
    doc.setTextColor(...negro)
    doc.text(r.val, valX, y + 9 + i * 10, { align: 'right' })
  })

  y += 32

  // Garantía y condiciones
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...gris)
  doc.text('CONDICIONES DE GARANTÍA:', margin, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...negro)
  const garantia = `Garantía de ${orden.garantia_dias ?? 7} días sobre la falla reparada. No cubre daños por golpes, humedad o manejo inadecuado. El equipo no retirado después de 30 días pasará a ser considerado abandonado.`
  const garantiaLines = doc.splitTextToSize(garantia, pageW - margin * 2)
  doc.text(garantiaLines, margin, y + 11)

  y += 11 + garantiaLines.length * 4 + 8

  // Firmas
  const firmaW = (pageW - margin * 2 - 10) / 2
  doc.line(margin, y + 14, margin + firmaW, y + 14)
  doc.line(margin + firmaW + 10, y + 14, pageW - margin, y + 14)
  doc.setFontSize(8)
  doc.setTextColor(...gris)
  doc.text('Firma del cliente', margin + firmaW / 2, y + 19, { align: 'center' })
  doc.text('Firma del técnico', margin + firmaW + 10 + firmaW / 2, y + 19, { align: 'center' })

  // Footer
  doc.setFontSize(7)
  doc.setTextColor(...gris)
  doc.text(`${tenant.nombre} · ${tenant.telefono ?? ''} · ${tenant.email ?? ''}`, pageW / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' })

  return doc
}
