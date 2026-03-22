import React from 'react'
import { cn } from '@/lib/utils'

export const Card = ({ className, ...props }) => (
  <div
    className={cn(
      'rounded-2xl border border-outline/20 bg-surface-lowest shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover p-6',
      className
    )}
    {...props}
  />
)

export const CardHeader = ({ className, ...props }) => <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />

export const CardTitle = ({ className, ...props }) => <h3 className={cn('font-heading text-lg font-semibold leading-none tracking-tight text-white', className)} {...props} />

export const CardContent = ({ className, ...props }) => <div className={cn('pt-0', className)} {...props} />

export const CardDescription = ({ className, ...props }) => <p className={cn('text-sm text-onsurface-variant', className)} {...props} />

export const CardFooter = ({ className, ...props }) => <div className={cn('flex items-center pt-4', className)} {...props} />
