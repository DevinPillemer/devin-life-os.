import React from 'react'
import { cn } from '@/lib/utils'

export function Button({ className, variant = 'default', asChild = false, children, ...props }) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50',
    variant === 'outline' ? 'border border-gray-700 bg-gray-900 hover:bg-gray-800' : 'bg-teal-500 text-gray-950 hover:bg-teal-400',
    className
  )
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { ...props, className: cn(classes, children.props.className) })
  }
  return <button className={classes} {...props}>{children}</button>
}
