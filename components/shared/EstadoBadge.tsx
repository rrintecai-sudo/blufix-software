import { cn } from '@/lib/utils'
import { ESTADO_ORDEN_CONFIG, type EstadoOrden } from '@/lib/types'

interface EstadoBadgeProps {
  estado: EstadoOrden
  size?: 'sm' | 'md'
  className?: string
}

export function EstadoBadge({ estado, size = 'md', className }: EstadoBadgeProps) {
  const config = ESTADO_ORDEN_CONFIG[estado]
  if (!config) return null

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.color,
        config.bg,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      {config.label}
    </span>
  )
}
