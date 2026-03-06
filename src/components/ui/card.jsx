import React from 'react'
import { cn } from '@/lib/utils'

export const Card = ({ className, ...props }) => <div className={cn('rounded-xl bg-card border border-border/50 shadow-card transition-all duration-200 hover:shadow-card-hover p-6', className)} {...props} />

export const CardHeader = ({ className, ...props }) => <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />

export const CardTitle = ({ className, ...props }) => <h3 className={cn('text-lg font-semibold leading-none tracking-tight text-white', className)} {...props} />

export const CardContent = ({ className, ...props }) => <div className={cn('pt-0', className)} {...props} />

export const CardDescription = ({ className, ...props }) => <p className={cn('text-sm text-muted', className)} {...props} />

export const CardFooter = ({ className, ...props }) => <div className={cn('flex items-center pt-4', className)} {...props} />
