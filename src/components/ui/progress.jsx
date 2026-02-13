import React from 'react'

export function Progress({ value = 0 }) {
  const safe = Math.max(0, Math.min(100, value))
  return <div className="h-3 w-full overflow-hidden rounded-full bg-gray-800"><div className="h-full bg-teal-500" style={{ width: `${safe}%` }} /></div>
}
