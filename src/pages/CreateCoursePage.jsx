import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Wand2, AlertCircle, CheckCircle, Loader2, ArrowLeft, X } from 'lucide-react'

const CURRENCY_SYMBOL = '₪'
const MILESTONE_REWARD = 10
const TOTAL_REWARD_PER_COURSE = 25

const CATEGORIES = [
  'Business/Leadership', 'Psychology', 'Philosophy', 'Self-Help', 'Finance',
  'Strategy', 'Spirituality', 'Parenting', 'Communication', 'Negotiation',
  'History', 'AI/Technology', 'Relationships', 'Leadership', 'Health'
]

// Parse Blinkist-style text into structured course data
function parseBlinkistText(text) {
  const lines = text.split('\n').filter(l => l.trim())
  let title = '', author = '', description = '', category = 'Self-Help'
  const modules = []
  let currentModule = null
  let inKeyInsights = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Detect title (first non-empty line or contains "by")
    if (!title && (i === 0 || line.toLowerCase().includes('by '))) {
      if (line.toLowerCase().includes('by ')) {
        const parts = line.split(/\s+by\s+/i)
        title = parts[0].trim()
        author = parts[1]?.trim() || 'Unknown'
      } else {
        title = line
      }
      continue
    }
    
    // Detect author line
    if (!author && line.toLowerCase().startsWith('by ')) {
      author = line.substring(3).trim()
      continue
    }
    
    // Detect key insights section
    if (line.toLowerCase().includes('key insight') || line.toLowerCase().includes('what\'s in it')) {
      inKeyInsights = true
      continue
    }
    
    // Detect numbered chapters/modules
    const moduleMatch = line.match(/^(\d+)[.\)\s]+(.+)/)
    if (moduleMatch) {
      if (currentModule) modules.push(currentModule)
      currentModule = {
        id: `module-${modules.length + 1}`,
        title: moduleMatch[2].trim(),
        keyInsight: '',
        content: '',
        bulletPoints: [],
        completed: false
      }
      continue
    }
    
    // Build content
    if (currentModule) {
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        currentModule.bulletPoints.push(line.replace(/^[•\-*]\s*/, ''))
      } else if (!currentModule.keyInsight && line.length > 20) {
        currentModule.keyInsight = line
      } else {
        currentModule.content += (currentModule.content ? ' ' : '') + line
      }
    } else if (!description && line.length > 30) {
      description = line
    }
  }
  
  if (currentModule) modules.push(currentModule)
  
  // Ensure at least some modules
  if (modules.length === 0) {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50)
    paragraphs.slice(0, 6).forEach((p, i) => {
      const firstSentence = p.split('.')[0]
      modules.push({
        id: `module-${i + 1}`,
        title: firstSentence.slice(0, 60) + (firstSentence.length > 60 ? '...' : ''),
        keyInsight: p.split('.').slice(0, 2).join('.'),
        content: p,
        bulletPoints: [],
        completed: false
      })
    })
  }
  
  return {
    id: `course-${Date.now()}`,
    title: title || 'Untitled Course',
    author: author || 'Unknown',
    description: description || `A course covering key concepts and insights.`,
    category,
    modules,
    totalReward: modules.length * (TOTAL_REWARD_PER_COURSE / 6),
    rewardPerModule: (TOTAL_REWARD_PER_COURSE / modules.length).toFixed(2),
    status: 'not_started',
    progress: 0,
    createdAt: new Date().toISOString()
  }
}

export default function CreateCoursePage() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [generatedCourse, setGeneratedCourse] = useState(null)
  const [manualEntry, setManualEntry] = useState(false)
  
  const handleInputChange = (value) => {
    setSummary(value)
    setError('')
    setGeneratedCourse(null)
  }
  
  const generateCourse = async () => {
    if (!summary.trim()) {
      setError('Please paste the Blinkist summary or book content first.')
      return
    }
    
    setIsGenerating(true)
    setError('')
    setGeneratedCourse(null)
    
    try {
      // Parse the text into a structured course
      const course = parseBlinkistText(summary)
      
      // Simulate AI processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (course.modules.length === 0) {
        setError('Could not parse content into modules. Please try different text or use manual entry.')
        return
      }
      
      setGeneratedCourse(course)
    } catch (err) {
      setError('Failed to generate course. Please try again.')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }
  
  const confirmAndAddCourse = () => {
    if (!generatedCourse) return
    
    // Save to localStorage
    const stored = localStorage.getItem('customCourses')
    const courses = stored ? JSON.parse(stored) : []
    courses.push(generatedCourse)
    localStorage.setItem('customCourses', JSON.stringify(courses))
    
    setSuccess('Course created successfully!')
    
    // Navigate to course outline
    setTimeout(() => {
      navigate(`/courseoutline/${generatedCourse.id}`)
    }, 500)
  }
  
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-teal-400" />
          Add a New Course
        </h1>
      </div>
      
      {/* Main Card */}
      <Card className="bg-slate-800/60 border-slate-700 p-6 max-w-4xl mx-auto">
        {/* Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Manual Entry</span>
            <button 
              onClick={() => setManualEntry(!manualEntry)}
              className={`w-12 h-6 rounded-full transition-colors ${manualEntry ? 'bg-teal-500' : 'bg-slate-600'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${manualEntry ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <Button 
            onClick={generateCourse} 
            disabled={isGenerating || !summary.trim()}
            className="bg-teal-500 hover:bg-teal-600 text-white"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Wand2 className="w-4 h-4 mr-2" /> Parse & Create</>
            )}
          </Button>
        </div>
        
        {/* Input Area */}
        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-2">Paste Blinkist summary or book content:</label>
          <textarea
            value={summary}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Paste the full Blinkist summary here...\n\nExample format:\nThe Lean Startup by Eric Ries\n\n1. Start with a Vision\nEntrepreneurs need to have a clear vision...\n\n2. Define and Test Hypotheses\nTest your assumptions early..."
            className="w-full h-64 bg-slate-900 border border-slate-600 rounded-lg p-4 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none resize-none"
          />
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        )}
        
        {/* Success Display */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-6">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400">{success}</span>
          </div>
        )}
        
        {/* Generated Course Preview */}
        {generatedCourse && (
          <Card className="bg-slate-900/60 border-slate-600 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{generatedCourse.title}</h2>
                <p className="text-slate-400">by {generatedCourse.author}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400">Modules</p>
                <p className="text-3xl font-bold text-teal-400">{generatedCourse.modules.length}</p>
              </div>
            </div>
            
            <p className="text-slate-300 mb-4">{generatedCourse.description}</p>
            
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-slate-400">Reward</p>
                <p className="text-2xl font-bold text-teal-400">{CURRENCY_SYMBOL}{generatedCourse.totalReward.toFixed(0)}</p>
              </div>
              <p className="text-slate-500">≈ {CURRENCY_SYMBOL}{generatedCourse.rewardPerModule} per module</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm text-slate-400 mb-2">Module titles</h3>
              <div className="grid grid-cols-2 gap-2">
                {generatedCourse.modules.map((m, i) => (
                  <p key={m.id} className="text-slate-300 text-sm">
                    {i + 1}. {m.title}
                  </p>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setGeneratedCourse(null)}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <X className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button 
                onClick={confirmAndAddCourse}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Confirm & Add Course
              </Button>
            </div>
          </Card>
        )}
      </Card>
    </div>
  )
}
