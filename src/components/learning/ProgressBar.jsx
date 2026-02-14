import { Progress } from '@/components/ui/progress'

export default function LearningProgressBar({ value, label }) {
  return (
    <div className="space-y-1">
      {label && <p className="text-sm text-slate-300">{label}</p>}
      <Progress value={value} />
    </div>
  )
}
