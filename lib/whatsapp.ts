import { generarLinkWhatsApp, interpolarMensaje } from '@/lib/utils'
import type { OrdenResumen, PlantillaWhatsapp, Tenant } from '@/lib/types'

type EventoWhatsapp = PlantillaWhatsapp['evento']

export function generarMensajeOrden(
  evento: EventoWhatsapp,
  orden: OrdenResumen,
  tenant: Tenant,
  plantilla: string
): string {
  const variables: Record<string, string> = {
    cliente: orden.cliente_nombre || 'Cliente',
    modelo: `${orden.marca} ${orden.modelo}`,
    numero_orden: String(orden.numero_orden),
    precio: orden.precio_cobrado_usd ? `${orden.precio_cobrado_usd.toFixed(2)}` : '0.00',
    taller: tenant.nombre,
  }
  return interpolarMensaje(plantilla, variables)
}

export function abrirWhatsApp(telefono: string, mensaje: string): void {
  const link = generarLinkWhatsApp(telefono, mensaje)
  window.open(link, '_blank')
}
