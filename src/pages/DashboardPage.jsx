import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import CashKpiStrip from '@/components/dashboard/CashKpiStrip'
import { COURSES, INCENTIVE_CONFIG } from '@/data/seedData'
import { Plus, CheckCircle, RotateCcw, Sparkles, BookOpen } from 'lucide-react'

const statusGroups = [
  { key: 'completed', label: 'Completed Courses' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'not_started', label: 'Not Started' }
]

export default function DashboardPage() {
  const [customCourses, setCustomCourses] = useState([])
  const learningConfig = INCENTIVE_CONFIG.sections.learning
  
  useEffect(() => {
    const stored = localStorage.getItem('customCourses')
    if (stored) setCustomCourses(JSON.parse(stored))
  }, [])
  
  const allCourses = [...COURSES, ...customCourses]
  
  const progressFor = (course) => {
    if (course.status === 'completed') return 100
    if (course.status === 'not_started') return 0
    return Math.round((Math.floor(course.modules.length / 2) / course.modules.length) * 100)
  }
  
  const earnedFor = (course) => {
    const progress = progressFor(course)
    const completedModules = Math.round((progress / 100) * course.modules.length)
    return completedModules * INCENTIVE_CONFIG.learningRate
  }
  
  const totalEarned = Math.min(
    learningConfig.max,
    allCourses.reduce((sum, course) => sum + earnedFor(course), 0)
  )
  
  const completedCount = allCourses.filter(c => c.status === 'completed').length
  const hasAccelerator = completedCount >= 7 // 7-day streak equivalent
  const acceleratorBonus = hasAccelerator ? learningConfig.accelerator : 0
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">Learning Dashboard</h2>
          <p className="text-gray-400 mt-1">{allCourses.length} courses with tracked module progress and incentives.</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link to="/createcourse"><Plus className="w-4 h-4 mr-2" /> New Course</Link>
        </Button>
      </div>
      
      <CashKpiStrip earned={totalEarned} base={learningConfig.base} accel={acceleratorBonus} />
      
      {/* Daily Knowledge Challenge */}
      <Card className="p-4 bg-gradient-to-r from-pink-900/30 to-purple-900/30 border-pink-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="font-semibold">Daily Knowledge Challenge</p>
              <p className="text-sm text-gray-400">Earn ₪10 per milestone • 7/7 quizzes completed</p>
            </div>
          </div>
          <Button asChild variant="outline" className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10">
            <Link to="/dailyquiz">Start Quiz →</Link>
          </Button>
        </div>
      </Card>
      
      {/* Add New Course Card */}
      <Card className="p-6 border-dashed border-2 border-gray-700 bg-gray-900/30 hover:border-emerald-500/50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-gray-500" />
            <div>
              <p className="font-medium">Add a New Course</p>
              <p className="text-sm text-gray-500">Paste, parse, and create a course from any text or link.</p>
            </div>
          </div>
          <Button asChild variant="outline" className="border-emerald-500 text-emerald-400">
            <Link to="/createcourse"><Plus className="w-4 h-4 mr-2" /> New Course</Link>
          </Button>
        </div>
      </Card>
      
      {statusGroups.map(group => {
        const items = allCourses.filter(course => course.status === group.key)
        if (items.length === 0) return null
        
        return (
          <section key={group.key} className="space-y-3">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              {group.key === 'completed' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {group.label} <span className="text-gray-500 font-normal">({items.length})</span>
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {items.map(course => {
                const progress = progressFor(course)
                const earned = earnedFor(course)
                const completedModules = Math.round((progress / 100) * course.modules.length)
                
                return (
                  <Card key={course.id} className="p-4 space-y-3 bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{course.title}</p>
                        <p className="text-sm text-gray-400">{course.author} • {course.publicationDate}</p>
                        <p className="text-sm text-emerald-400 mt-1">{course.category}</p>
                      </div>
                      {course.status === 'completed' && (
                        <span className="text-emerald-400 font-semibold text-sm whitespace-nowrap">+₪{earned} Earned</span>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress: {completedModules}/{course.modules.length} milestones</span>
                        {course.status !== 'completed' && <span>{progress}%</span>}
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between items-center pt-1">
                      <p className="text-sm text-gray-500">Modules: {completedModules}/{course.modules.length}</p>
                      {course.status === 'completed' ? (
                        <Button variant="outline" size="sm" className="text-gray-400 border-gray-700 hover:border-gray-600" asChild>
                          <Link to={`/course/${course.id}`}><RotateCcw className="w-3 h-3 mr-1" /> Review Again</Link>
                        </Button>
                      ) : (
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                          <Link to={`/course/${course.id}`}>{course.status === 'not_started' ? 'Start' : 'Continue'}</Link>
                        </Button>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
