import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formato de fecha venezolano: DD/MM/YYYY
export function formatFecha(date: string | Date | null): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: es })
}

// Formato fecha + hora
export function formatFechaHora(date: string | Date | null): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy HH:mm', { locale: es })
}

// Formato de moneda USD
export function formatUSD(amount: number | null | undefined): string {
  if (amount == null) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

// Formato de bolívares
export function formatBs(amount: number | null | undefined): string {
  if (amount == null) return 'Bs. 0,00'
  return `Bs. ${new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`
}

// Calcular Bs. desde USD con tasa
export function usdToBs(usd: number | null, tasa: number | null): number {
  if (!usd || !tasa) return 0
  return usd * tasa
}

// Formatear tasa BCV
export function formatTasa(tasa: number | null | undefined): string {
  if (!tasa) return '0.0000'
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(tasa)
}

// Obtener iniciales de nombre
export function getInitials(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

// Truncar texto
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

// Generar link de WhatsApp
export function generarLinkWhatsApp(telefono: string, mensaje: string): string {
  const telefonoLimpio = telefono.replace(/\D/g, '')
  // Convertir número venezolano al formato internacional
  const telefonoIntl = telefonoLimpio.startsWith('0')
    ? '58' + telefonoLimpio.slice(1)
    : telefonoLimpio
  const mensajeCodificado = encodeURIComponent(mensaje)
  return `https://wa.me/${telefonoIntl}?text=${mensajeCodificado}`
}

// Interpolar variables en plantillas de WhatsApp
export function interpolarMensaje(
  plantilla: string,
  variables: Record<string, string>
): string {
  let mensaje = plantilla
  Object.entries(variables).forEach(([key, value]) => {
    mensaje = mensaje.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  })
  return mensaje
}
