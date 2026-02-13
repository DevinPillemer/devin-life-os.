import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
export default function GoalCard({ goal }) { return <Card><h3>{goal.title}</h3><Progress value={goal.progress} /></Card> }
