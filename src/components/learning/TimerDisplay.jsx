export default function TimerDisplay({ seconds, mode = 'countdown' }) {
  const safe = Math.max(0, Math.floor(seconds || 0))
  const mins = String(Math.floor(safe / 60)).padStart(2, '0')
  const secs = String(safe % 60).padStart(2, '0')

  return (
    <div className="rounded-lg border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-200">
      {mode === 'countdown' ? 'Time left' : 'Time elapsed'}: {mins}:{secs}
    </div>
  )
}
