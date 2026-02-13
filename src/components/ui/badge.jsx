import React from 'react'
import { cn } from '@/lib/utils'

export const Badge = ({ className, ...props }) => (
  <span className={cn('rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300', className)} {...props} />
)
