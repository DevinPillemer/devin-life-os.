import React from 'react'
import { cn } from '@/lib/utils'

export function Progress({ value = 0, className = '', indicatorClassName = '' }) {
  const safe = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-highest/70', className)}>
      <div className={cn('h-full rounded-full bg-primary transition-all duration-300', indicatorClassName)} style={{ width: `${safe}%` }} />
    </div>
  )
}
