import React from 'react'
import { cn } from '@/lib/utils'

export function Alert({ className, variant = 'default', ...props }) {
  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4 text-sm',
        variant === 'destructive'
          ? 'border-red-500/50 text-red-400'
          : 'border-gray-700 text-gray-200',
        className
      )}
      {...props}
    />
  )
}

export function AlertTitle({ className, ...props }) {
  return <h5 className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />
}

export function AlertDescription({ className, ...props }) {
  return <div className={cn('text-sm opacity-90', className)} {...props} />
}
