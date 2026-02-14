import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function Select({ value, onValueChange, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative inline-block w-full">
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { value, onValueChange, open, setOpen })
          : child
      )}
    </div>
  )
}

export function SelectTrigger({ children, className, open, setOpen, ...props }) {
  return (
    <button
      type="button"
      onClick={() => setOpen && setOpen(!open)}
      className={cn('flex h-10 w-full items-center justify-between rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100', className)}
      {...props}
    >
      {children}
    </button>
  )
}

export function SelectValue({ placeholder, value }) {
  return <span>{value || placeholder}</span>
}

export function SelectContent({ children, open, onValueChange, setOpen, ...props }) {
  if (!open) return null
  return (
    <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-700 bg-gray-900 shadow-lg" {...props}>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { onValueChange, setOpen })
          : child
      )}
    </div>
  )
}

export function SelectItem({ children, value, onValueChange, setOpen, className, ...props }) {
  return (
    <div
      className={cn('cursor-pointer px-3 py-2 text-sm text-gray-100 hover:bg-gray-800', className)}
      onClick={() => { onValueChange && onValueChange(value); setOpen && setOpen(false) }}
      {...props}
    >
      {children}
    </div>
  )
}
