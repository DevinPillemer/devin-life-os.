import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import CashKpiStrip from '@/components/dashboard/CashKpiStrip'
import { COURSES, INCENTIVE_CONFIG } from '@/data/seedData'
import { Plus, CheckCircle, RotateCcw, Sparkles, BookOpen, Heart, Wallet } from 'lucide-react'

// Constants matching Base44
const CURRENCY_SYMBOL = '₪'
const MILESTONE_REWARD = 10
const MONTHLY_BASE_CAP = 200
const MONTHLY_MAX_CAP = 240
const MAX_MILESTONES_PER_MONTH = 20

// Motivational quotes
const QUOTES = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
]

const statusGroups = [
  { key: 'completed', label: 'Completed Courses' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'not_started', label: 'Not Started' }
]

export default function DashboardPage() {
  const [customCourses, setCustomCourses] = useState([])
  const learningConfig = INCENTIVE_CONFIG.sections.learning
  const [todayQuote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])

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
    return completedModules * MILESTONE_REWARD
  }

  const totalEarned = Math.min(
    MONTHLY_BASE_CAP,
    allCourses.reduce((sum, course) => sum + earnedFor(course), 0)
  )

  const completedCount = allCourses.filter(c => c.status === 'completed').length
  const hasAccelerator = completedCount >= 7
  const acceleratorBonus = hasAccelerator ? (MONTHLY_MAX_CAP - MONTHLY_BASE_CAP) : 0
  const xpThisWeek = allCourses.filter(c => c.status === 'completed').reduce((sum, c) => sum + earnedFor(c), 0)

  return (
    <div className="space-y-6">
      {/* Welcome Header - Base44 Style */}
      <Card className="bg-slate-800/60 border-slate-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back, Doodle Mcluvin!</h1>
              <p className="text-slate-400 italic mt-1">"{todayQuote.text}"</p>
              <div className="flex items-center gap-2 mt-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-teal-400">XP this week: +{xpThisWeek}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" className="border-teal-500 text-teal-400 hover:bg-teal-500/10">
            <Wallet className="w-4 h-4 mr-2" />
            View Total Earnings
          </Button>
        </div>
      </Card>

      {/* Daily Knowledge Challenge - Base44 Style */}
      <Card className="bg-slate-800/70 border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">❤️</span>
            <div>
              <h3 className="font-semibold text-white">Daily Knowledge Challenge</h3>
              <p className="text-sm text-slate-400">Earn {CURRENCY_SYMBOL}{MILESTONE_REWARD} per milestone • 5/7 quizzes completed</p>
            </div>
          </div>
          <Link to="/quiz">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
              Start Quiz →
            </Button>
          </Link>
        </div>
      </Card>

      {/* Add New Course Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Add a New Course</h2>
          <p className="text-sm text-slate-400">Paste, parse, and create a course from any text or link.</p>
        </div>
        <Link to="/createcourse">
          <Button className="bg-teal-500 hover:bg-teal-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </Button>
        </Link>
      </div>

      {/* Course Groups */}
      {statusGroups.map(group => {
        const items = allCourses.filter(course => course.status === group.key)
        if (items.length === 0) return null
        return (
          <div key={group.key} className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              {group.key === 'completed' && <CheckCircle className="w-5 h-5 text-teal-400" />}
              {group.label}
              <span className="text-slate-400 font-normal">({items.length})</span>
            </h3>
            {items.map(course => {
              const progress = progressFor(course)
              const earned = earnedFor(course)
              const completedModules = Math.round((progress / 100) * course.modules.length)
              return (
                <Card key={course.id} className="bg-slate-800/50 border-slate-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        course.status === 'completed' ? 'bg-teal-500/20' : 'bg-slate-700'
                      }`}>
                        <CheckCircle className={`w-5 h-5 ${
                          course.status === 'completed' ? 'text-teal-400' : 'text-slate-500'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{course.title}</h4>
                        <p className="text-sm text-slate-400">
                          Progress: {progress}% | {course.modules.length} milestones | Reviewed: {course.status === 'completed' ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {course.status === 'completed' && (
                        <span className="text-teal-400 font-semibold">+{CURRENCY_SYMBOL}{earned} Earned</span>
                      )}
                      <Link to={`/course/${course.id}`}>
                        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                          {course.status === 'completed' ? 'Review Again' : course.status === 'not_started' ? 'Start' : 'Continue'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
