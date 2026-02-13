import { Card } from '@/components/ui/card'
export default function ModulePage({ module }) { return <Card><h3 className="font-semibold">{module.title}</h3><p>{module.content}</p></Card> }
