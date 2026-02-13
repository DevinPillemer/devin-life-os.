import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
export default function BudgetTracker({ spent = 320, budget = 1000 }) { return <Card><p>Spent ₪{spent} / ₪{budget}</p><Progress value={(spent/budget)*100} /></Card> }
