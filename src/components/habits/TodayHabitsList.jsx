import { Badge } from '@/components/ui/badge'
const habits=['Weight Training','Prayer','Wake up 7am','Read Before Bed','Meat Night']
export default function TodayHabitsList(){return <div className="card p-4 space-y-2">{habits.map(h=><div key={h} className="flex justify-between"><span>{h}</span><Badge>pending</Badge></div>)}</div>}
