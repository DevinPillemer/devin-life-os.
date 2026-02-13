import GoalCard from '@/components/goals/GoalCard'
import GoalForm from '@/components/goals/GoalForm'
import WeeklyGoalTracker from '@/components/goals/WeeklyGoalTracker'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export default function GoalsTrackerPage(){
  const [goals,setGoals]=useLocalStorage('goals',[{id:'g1',title:'Ship Floopify',progress:70},{id:'g2',title:'Read 2 books',progress:45}])
  return <div className="space-y-4"><h2 className="text-2xl font-bold">Goals Tracker</h2><GoalForm onAdd={(title)=>setGoals([{id:crypto.randomUUID(),title,progress:0},...goals])}/><div className="grid gap-3 md:grid-cols-2">{goals.map(g=><GoalCard key={g.id} goal={g}/>)}</div><WeeklyGoalTracker/></div>
}
