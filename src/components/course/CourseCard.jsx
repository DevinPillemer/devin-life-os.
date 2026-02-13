import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
export default function CourseCard({ course }) { return <Card><h3 className="font-semibold">{course.name}</h3><p>{course.progress}% • ₪{course.earned}</p><Button asChild className="mt-2"><Link to={`/course/${course.id}`}>Open</Link></Button></Card> }
