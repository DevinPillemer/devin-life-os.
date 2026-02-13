import { useState } from 'react'
import { Button } from '@/components/ui/button'
export default function GoalForm({ onAdd }) { const [title,setTitle]=useState(''); return <div className="flex gap-2"><input className="rounded bg-gray-800 px-2" value={title} onChange={e=>setTitle(e.target.value)} placeholder="New goal"/><Button onClick={()=>{if(title){onAdd(title);setTitle('')}}}>Add</Button></div> }
