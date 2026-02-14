import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { COURSES } from '@/data/seedData'
import { ArrowLeft, ArrowRight, BookOpen, Coins, CheckCircle, Circle, ChevronRight } from 'lucide-react'

const CURRENCY_SYMBOL = '₪'
const TOTAL_REWARD = 25

export default function CourseOutlinePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [moduleStates, setModuleStates] = useState({})
  
  useEffect(() => {
    // Check seed data first
    let foundCourse = COURSES.find(c => c.id === id)
    
    // Check custom courses
    if (!foundCourse) {
      const stored = localStorage.getItem('customCourses')
      if (stored) {
        const customCourses = JSON.parse(stored)
        foundCourse = customCourses.find(c => c.id === id)
      }
    }
    
    if (foundCourse) {
      setCourse(foundCourse)
      // Load module completion states
      const savedStates = localStorage.getItem(`course-${id}-modules`)
      if (savedStates) {
        setModuleStates(JSON.parse(savedStates))
      } else {
        // Initialize with modules from course
        const initial = {}
        foundCourse.modules?.forEach(m => {
          initial[m.id] = m.completed || false
        })
        setModuleStates(initial)
      }
    }
  }, [id])
  
  if (!course) {
    return (
      <div className="min-h-screen bg-slate-900 p-6 flex items-center justify-center">
        <p className="text-slate-400">Loading course...</p>
      </div>
    )
  }
  
  const modules = course.modules || []
  const completedCount = Object.values(moduleStates).filter(Boolean).length
  const progressPercent = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0
  const rewardPerModule = modules.length > 0 ? (TOTAL_REWARD / modules.length).toFixed(2) : 0
  const earnedReward = (completedCount * parseFloat(rewardPerModule)).toFixed(2)
  
  const toggleModule = (moduleId) => {
    const newStates = { ...moduleStates, [moduleId]: !moduleStates[moduleId] }
    setModuleStates(newStates)
    localStorage.setItem(`course-${id}-modules`, JSON.stringify(newStates))
  }
  
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{course.title}</h1>
              <p className="text-sm text-slate-400">by {course.author}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="border-slate-600 text-slate-300">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Link to={`/course/${id}/module/0`}>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                Start Course <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Overview Card */}
        <Card className="bg-slate-800/60 border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Overview</h2>
          <div className="grid grid-cols-3 gap-6">
            {/* Progress */}
            <div>
              <p className="text-sm text-slate-400 mb-2">Progress</p>
              <Progress value={progressPercent} className="h-2 mb-2" />
              <p className="text-lg font-semibold text-white">{progressPercent}%</p>
              <p className="text-xs text-slate-500">{completedCount}/{modules.length} modules</p>
            </div>
            
            {/* Reward Allocation */}
            <div>
              <p className="text-sm text-slate-400 mb-2">Reward Allocation</p>
              <div className="bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-lg inline-flex items-center gap-2">
                <Coins className="w-4 h-4" />
                <span className="font-semibold">Total {CURRENCY_SYMBOL}{TOTAL_REWARD}.00</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">≈ {CURRENCY_SYMBOL}{rewardPerModule} per module</p>
            </div>
            
            {/* Continue */}
            <div>
              <p className="text-sm text-slate-400 mb-2">Continue</p>
              <p className="text-sm text-slate-300">Pick any module below to mark done and allocate rewards.</p>
            </div>
          </div>
        </Card>
        
        {/* Modules List */}
        <div className="space-y-3">
          {modules.map((module, index) => {
            const isCompleted = moduleStates[module.id]
            return (
              <Card key={module.id} className={`border-slate-700 p-4 transition-colors ${
                isCompleted ? 'bg-teal-500/10 border-teal-500/30' : 'bg-slate-800/60'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleModule(module.id)}
                      className="focus:outline-none"
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-teal-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-500" />
                      )}
                    </button>
                    <div>
                      <p className="font-medium text-white">{index + 1}. {module.title}</p>
                      <p className="text-sm text-slate-400">Module {index + 1}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isCompleted ? 'bg-teal-500/20 text-teal-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      <Coins className="w-3 h-3 inline mr-1" />
                      +{CURRENCY_SYMBOL}{rewardPerModule}
                    </div>
                    <button
                      onClick={() => toggleModule(module.id)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        isCompleted ? 'bg-teal-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                        isCompleted ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                    <Link to={`/course/${id}/module/${index}`}>
                      <Button variant="ghost" className="text-slate-400 hover:text-white">
                        Open <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
        
        {/* Summary */}
        <Card className="bg-slate-800/60 border-slate-700 p-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-slate-300">Total Earned:</span>
              <span className="text-xl font-bold text-teal-400">{CURRENCY_SYMBOL}{earnedReward}</span>
              <span className="text-slate-500">/ {CURRENCY_SYMBOL}{TOTAL_REWARD}</span>
            </div>
            {completedCount === modules.length && modules.length > 0 && (
              <Link to={`/certificate/${id}`}>
                <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                  View Certificate
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
