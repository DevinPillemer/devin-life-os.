import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Wand2, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'

const CATEGORIES = [
  'Business/Leadership', 'Psychology', 'Philosophy', 'Self-Help', 'Finance',
  'Strategy', 'Spirituality', 'Parenting', 'Communication', 'Negotiation',
  'History', 'AI/Technology', 'Relationships', 'Leadership', 'Health'
]

function parseBlinkistText(text) {
  const lines = text.split('\n').filter(l => l.trim())
  let title = '', author = '', year = '', description = '', category = 'Self-Help'
  const modules = []
  let currentModule = null
  let inKeyInsights = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Detect title (usually first non-empty line or contains "by")
    if (!title && (i === 0 || line.toLowerCase().includes('by '))) {
      const byMatch = line.match(/(.+?)\s+by\s+(.+)/i)
      if (byMatch) {
        title = byMatch[1].trim()
        author = byMatch[2].trim()
      } else if (i === 0) {
        title = line
      }
      continue
    }
    
    // Detect author if not found yet
    if (!author && line.toLowerCase().startsWith('by ')) {
      author = line.replace(/^by\s+/i, '').trim()
      continue
    }
    
    // Detect year (4 digits)
    const yearMatch = line.match(/\b(19\d{2}|20\d{2})\b/)
    if (yearMatch && !year) {
      year = yearMatch[1]
    }
    
    // Detect module headers (numbered, "Chapter", "Part", "Section" etc.)
    const moduleMatch = line.match(/^(?:Chapter|Part|Section|Blink|\d+[.):])\s*(.+)/i) ||
                         line.match(/^#+\s*(.+)/) ||
                         (line.length < 80 && line.endsWith(':') && !line.includes('.'))
    
    if (moduleMatch || (line.length < 60 && line === line.toUpperCase() && line.length > 3)) {
      if (currentModule) modules.push(currentModule)
      currentModule = {
        title: moduleMatch ? (moduleMatch[1] || line).replace(/:$/, '').trim() : line,
        content: '',
        key_insights: []
      }
      inKeyInsights = false
      continue
    }
    
    // Detect key insights section
    if (line.toLowerCase().includes('key insight') || line.toLowerCase().includes('takeaway')) {
      inKeyInsights = true
      continue
    }
    
    // Add content to current module
    if (currentModule) {
      if (inKeyInsights || line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./)) {
        const insight = line.replace(/^[-•\d.]+\s*/, '').trim()
        if (insight.length > 5 && insight.length < 100) {
          currentModule.key_insights.push(insight)
        }
      } else {
        currentModule.content += (currentModule.content ? ' ' : '') + line
      }
    } else if (!description && line.length > 30) {
      description = line
    }
  }
  
  if (currentModule) modules.push(currentModule)
  
  // Clean up modules - ensure each has at least some content
  const cleanedModules = modules.filter(m => m.title && (m.content || m.key_insights.length))
    .map((m, i) => ({
      ...m,
      title: m.title || `Module ${i + 1}`,
      content: m.content || m.key_insights.join('. ') || 'Content from Blinkist summary',
      key_insights: m.key_insights.length ? m.key_insights.slice(0, 5) : 
        [m.content.split('.').filter(s => s.trim().length > 10).slice(0, 3)].flat()
    }))
  
  return {
    title: title || 'Untitled Course',
    author: author || 'Unknown Author',
    publicationDate: year || new Date().getFullYear().toString(),
    description: description || `A course based on ${title || 'Blinkist summary'}`,
    category,
    modules: cleanedModules.length ? cleanedModules : [{
      title: 'Main Concepts',
      content: text.slice(0, 500),
      key_insights: ['Key insight from the book']
    }]
  }
}

export default function CreateCoursePage() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [parsed, setParsed] = useState(null)
  const [editedCourse, setEditedCourse] = useState(null)
  
  const handleParse = () => {
    if (!input.trim()) {
      setError('Please paste your Blinkist summary or book content')
      return
    }
    setError('')
    setIsProcessing(true)
    
    setTimeout(() => {
      try {
        const result = parseBlinkistText(input)
        setParsed(result)
        setEditedCourse(result)
        setIsProcessing(false)
      } catch (e) {
        setError('Failed to parse the text. Please check the format.')
        setIsProcessing(false)
      }
    }, 500)
  }
  
  const handleSave = () => {
    if (!editedCourse) return
    
    const newCourse = {
      id: `course-${Date.now()}`,
      ...editedCourse,
      status: 'not_started',
      createdAt: new Date().toISOString()
    }
    
    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('customCourses') || '[]')
    existing.push(newCourse)
    localStorage.setItem('customCourses', JSON.stringify(existing))
    
    navigate('/dashboard')
  }
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Create New Course</h2>
          <p className="text-gray-400">Paste text from Blinkist or any book summary</p>
        </div>
      </div>
      
      {!parsed ? (
        <Card className="p-6 space-y-4 bg-gray-900/50 border-gray-800">
          <div className="flex items-center gap-2 text-emerald-400">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Paste Blinkist Summary</span>
          </div>
          
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setError('') }}
            placeholder="Paste your Blinkist book summary here...\n\nThe parser will automatically detect:\n- Book title and author\n- Chapters/sections as modules\n- Key insights and takeaways"
            className="w-full h-64 p-4 rounded-xl bg-gray-800/80 border border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
          />
          
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <Button 
            onClick={handleParse} 
            disabled={isProcessing || !input.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><Wand2 className="w-4 h-4 mr-2" /> Parse & Generate Course</>
            )}
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-6 bg-gray-900/50 border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Course Preview</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setParsed(null); setEditedCourse(null) }}>
                Start Over
              </Button>
            </div>
            
            <div className="grid gap-4">
              <div>
                <label className="text-sm text-gray-400">Title</label>
                <input
                  value={editedCourse?.title || ''}
                  onChange={(e) => setEditedCourse({...editedCourse, title: e.target.value})}
                  className="w-full p-2 mt-1 rounded bg-gray-800 border border-gray-700 text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Author</label>
                  <input
                    value={editedCourse?.author || ''}
                    onChange={(e) => setEditedCourse({...editedCourse, author: e.target.value})}
                    className="w-full p-2 mt-1 rounded bg-gray-800 border border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Year</label>
                  <input
                    value={editedCourse?.publicationDate || ''}
                    onChange={(e) => setEditedCourse({...editedCourse, publicationDate: e.target.value})}
                    className="w-full p-2 mt-1 rounded bg-gray-800 border border-gray-700 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Category</label>
                <select
                  value={editedCourse?.category || ''}
                  onChange={(e) => setEditedCourse({...editedCourse, category: e.target.value})}
                  className="w-full p-2 mt-1 rounded bg-gray-800 border border-gray-700 text-white"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Description</label>
                <textarea
                  value={editedCourse?.description || ''}
                  onChange={(e) => setEditedCourse({...editedCourse, description: e.target.value})}
                  className="w-full p-2 mt-1 rounded bg-gray-800 border border-gray-700 text-white h-20 resize-none"
                />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gray-900/50 border-gray-800">
            <h3 className="font-semibold mb-4">Modules ({editedCourse?.modules?.length || 0})</h3>
            <div className="space-y-3">
              {editedCourse?.modules?.map((m, i) => (
                <div key={i} className="p-3 rounded bg-gray-800/50 border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-emerald-400">{m.title}</p>
                      <p className="text-sm text-gray-400 mt-1">{m.content?.slice(0, 120)}...</p>
                      {m.key_insights?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Key insights:</p>
                          <ul className="text-xs text-gray-400 list-disc list-inside">
                            {m.key_insights.slice(0, 3).map((k, j) => <li key={j}>{k}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setParsed(null); setEditedCourse(null) }}>
              Cancel
            </Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleSave}>
              <CheckCircle className="w-4 h-4 mr-2" /> Save Course
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
