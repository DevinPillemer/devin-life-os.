import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CashKpiStrip from '@/components/dashboard/CashKpiStrip'
import CourseCard from '@/components/course/CourseCard'

const courses=[{id:'1',name:'AI Product Thinking',progress:100,earned:80},{id:'2',name:'Finance Mastery',progress:65,earned:50}]

export default function DashboardPage(){
  return <div className="space-y-4"><h2 className="text-3xl font-bold">Welcome, Itay 👋</h2><p className="text-gray-400">"Small progress daily compounds into big life wins."</p>
  <div className="grid gap-3 md:grid-cols-2"><Card><h3>Daily Knowledge Challenge</h3><Button asChild className="mt-2"><Link to="/dailyquiz">Start Quiz</Link></Button></Card><Card><h3>Add New Course</h3><Button asChild className="mt-2"><Link to="/createcourse">Create Course</Link></Button></Card></div>
  <CashKpiStrip earned={130} />
  <div className="grid gap-3 md:grid-cols-2">{courses.map(c=><CourseCard key={c.id} course={c} />)}</div></div>
}
