import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CreateCoursePage(){const [input,setInput]=useState('');const [parsed,setParsed]=useState(null);return <div className="space-y-4"><h2 className="text-2xl font-bold">Create Course</h2><textarea value={input} onChange={e=>setInput(e.target.value)} className="h-40 w-full rounded-xl border border-gray-800 bg-gray-900 p-3" placeholder="Paste text or URL"/><Button onClick={()=>setParsed({title:'Parsed Course',modules:3})}>Parse</Button>{parsed && <Card>Generated: {parsed.title} ({parsed.modules} modules)</Card>}</div>}
