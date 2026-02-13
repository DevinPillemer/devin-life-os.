import React from 'react'
import { cn } from '@/lib/utils'

export const Card = ({ className, ...props }) => <div className={cn('card p-4', className)} {...props} />
