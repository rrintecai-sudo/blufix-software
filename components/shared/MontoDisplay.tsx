import { formatUSD, formatBs, usdToBs, formatTasa } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MontoDisplayProps {
  usd: number | null
  tasa: number | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showTasa?: boolean
}

export function MontoDisplay({
  usd,
  tasa,
  className,
  size = 'md',
  showTasa = false,
}: MontoDisplayProps) {
  const bs = usdToBs(usd, tasa)

  return (
    <div className={cn('space-y-0.5', className)}>
      <div
        className={cn(
          'font-semibold text-foreground',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-xl'
        )}
      >
        {formatUSD(usd)}
      </div>
      <div
        className={cn(
          'text-muted-foreground',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}
      >
        {formatBs(bs)}
      </div>
      {showTasa && tasa && (
        <div className="text-xs text-muted-foreground/70">
          Tasa: {formatTasa(tasa)}
        </div>
      )}
    </div>
  )
}
