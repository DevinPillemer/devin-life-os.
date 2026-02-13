import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
export default function CourseOutlinePage(){const {id}=useParams(); return <div className="space-y-3"><h2 className="text-2xl font-bold">Course Outline #{id}</h2><div className="card p-4">1. Intro Quiz 2. Deep Dive 3. Final Assessment</div><Button asChild><Link to={`/certificate/${id}`}>View Certificate</Link></Button></div>}
