import { Card } from '@/components/ui/card'
export default function StatsCards({ stats }) { return <div className="grid gap-3 md:grid-cols-4">{stats.map((s)=> <Card key={s.label}><p className="text-xs text-gray-400">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></Card>)}</div> }
