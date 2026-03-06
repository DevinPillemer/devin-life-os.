import React from 'react'

export function Progress({ value = 0 }) {
  const safe = Math.max(0, Math.min(100, value))
  return <div className="h-2 w-full overflow-hidden rounded-full bg-border/50"><div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${safe}%` }} /></div>
}
