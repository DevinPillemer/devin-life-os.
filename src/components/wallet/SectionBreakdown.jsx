import { Card } from '@/components/ui/card'
const data=[['Learning',180],['Daily Habits',214],['Health',205],['Goals',160],['Finance',190]]
export default function SectionBreakdown(){return <div className="grid gap-3 md:grid-cols-2">{data.map(([n,v])=><Card key={n}><p>{n}</p><p>₪{v}/240</p></Card>)}</div>}
