import { useParams, Link } from 'react-router-dom'
import ModulePage from '@/components/course/ModulePage'
import { Button } from '@/components/ui/button'

export default function CoursePage(){const {id}=useParams(); const module={title:`Module for course ${id}`,content:'Learn, quiz, and complete module milestones.'}; return <div className="space-y-4"><h2 className="text-2xl font-bold">Course {id}</h2><ModulePage module={module}/><Button asChild><Link to={`/courseoutline/${id}`}>Open Outline</Link></Button></div>}
