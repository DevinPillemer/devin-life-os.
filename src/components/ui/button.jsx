import React from 'react'
import { cn } from '@/lib/utils'

export function Button({ className, variant = 'default', asChild = false, children, ...props }) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed',
    variant === 'outline'
      ? 'border border-outline/30 bg-surface-highest/20 text-onsurface hover:bg-surface-highest/40'
      : 'bg-primary text-background hover:bg-primary-dark',
    className
  )
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { ...props, className: cn(classes, children.props.className) })
  }
  return <button className={classes} {...props}>{children}</button>
}
