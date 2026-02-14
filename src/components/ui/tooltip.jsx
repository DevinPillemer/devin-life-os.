import React, { useState } from 'react'
import { cn } from '@/lib/utils'

export function TooltipProvider({ children }) {
  return <>{children}</>
}

export function Tooltip({ children }) {
  return <div className="relative inline-flex">{children}</div>
}

export function TooltipTrigger({ children, asChild, ...props }) {
  return <span {...props}>{children}</span>
}

export function TooltipContent({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 rounded-md bg-gray-800 px-3 py-1.5 text-xs text-gray-100 shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
