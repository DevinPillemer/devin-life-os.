import React from 'react'
import { cn } from '@/lib/utils'

export const Card = ({ className, ...props }) => <div className={cn('card p-4', className)} {...props} />

export const CardHeader = ({ className, ...props }) => <div className={cn('flex flex-col space-y-1.5 pb-2', className)} {...props} />

export const CardTitle = ({ className, ...props }) => <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />

export const CardContent = ({ className, ...props }) => <div className={cn('pt-0', className)} {...props} />

export const CardDescription = ({ className, ...props }) => <p className={cn('text-sm text-muted-foreground', className)} {...props} />

export const CardFooter = ({ className, ...props }) => <div className={cn('flex items-center pt-2', className)} {...props} />
