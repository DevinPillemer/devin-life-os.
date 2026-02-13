import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function DailyQuizPage(){const [score,setScore]=useState(0);return <div className="space-y-3"><h2 className="text-2xl font-bold">Daily Quiz</h2><div className="card p-4">Question: What builds mastery?<div className="mt-2 flex gap-2"><Button onClick={()=>setScore(score+1)}>Consistency ✅</Button><Button variant="outline">Luck</Button></div></div><p>Streak score: {score}</p></div>}
