import { useState, useEffect } from 'react'

export default function AnimatedCounter({ end, duration = 1500, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime = null
    const startVal = 0

    function animate(timestamp) {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.floor(startVal + (end - startVal) * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [end, duration])

  return (
    <span className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}
