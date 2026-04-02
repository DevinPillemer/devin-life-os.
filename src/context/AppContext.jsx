import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AppContext = createContext()

export function useApp() {
  return useContext(AppContext)
}

// ── HEATMAP DATA ──
function generateHeatmapData() {
  const data = []
  const now = new Date()
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    data.push({ date: date.toISOString().split('T')[0], count: Math.floor(Math.random() * 5) })
  }
  return data
}

// ── HABITS (categorized with points) ──
const habitCategories = [
  {
    name: 'Health', color: 'accent',
    habits: [
      { id: 1, name: 'Swim', pts: 20, done: true },
      { id: 2, name: 'Weight Training', pts: 20, done: true },
      { id: 3, name: 'Neck', pts: 10, done: true },
      { id: 4, name: 'Electrolytes & vitamins', pts: 10, done: true },
    ],
  },
  {
    name: 'Focus', color: 'gold',
    habits: [
      { id: 5, name: 'In bed: 10:30pm', pts: 15, done: true },
      { id: 6, name: 'Wake up: 7am', pts: 15, done: true },
      { id: 7, name: 'Budget Check', pts: 12, done: true },
      { id: 8, name: 'Cat stuff', pts: 8, done: false },
    ],
  },
  {
    name: 'Learning', color: 'orange',
    habits: [
      { id: 9, name: 'Read Before Bed', pts: 15, done: true },
      { id: 10, name: 'Podcast', pts: 10, done: true },
      { id: 11, name: 'Blinkist', pts: 12, done: true },
      { id: 12, name: 'Innovation with AI', pts: 15, done: false },
    ],
  },
  {
    name: 'Spiritual', color: 'purple',
    habits: [
      { id: 13, name: 'Tefillin', pts: 15, done: true },
      { id: 14, name: 'Meditation', pts: 12, done: false },
      { id: 15, name: 'Charity', pts: 10, done: false },
    ],
  },
]

// ── GOALS (grouped) ──
const goalGroups = [
  {
    name: 'Family Life', color: 'accent', active: 9, done: 3,
    goals: [
      { id: 1, text: 'Therapy 1x / 2 weeks', priority: 'high', tag: 'Quick', date: 'Mar 4' },
      { id: 2, text: 'Date nights 1/2 weeks', priority: 'high', tag: 'Quick', date: 'Mar 17' },
      { id: 3, text: 'US: Itinerary Planning', priority: 'medium', tag: 'Standard', date: 'Mar 11' },
      { id: 4, text: 'Set Interview Lior Passport — Aug 7–15', priority: 'high', tag: 'Standard', date: 'May 14' },
      { id: 5, text: 'Airbnb Our Place!', priority: 'high', tag: 'Standard', date: 'Mar 8' },
      { id: 6, text: 'New doors install', priority: 'high', tag: 'Standard', date: 'Mar 5' },
    ],
  },
  {
    name: 'Individual', color: 'gold', active: 6, done: 0,
    goals: [
      { id: 7, text: 'Goals Overall', priority: 'high', tag: 'Deep', date: 'Mar 3' },
      { id: 8, text: 'Green card', priority: 'high', tag: 'Deep', date: 'Mar 5' },
      { id: 9, text: 'Order Fan / Watch (Aut)', priority: 'medium', tag: 'Quick', date: 'Mar 10' },
      { id: 10, text: 'Temu: HDMI cable', priority: 'medium', tag: 'Quick', date: 'Mar 5' },
    ],
  },
  {
    name: 'Finance', color: 'green', active: 2, done: 4,
    goals: [
      { id: 11, text: 'Buy USD for Aug trip (Laya)', priority: 'high', tag: 'Quick', date: 'May 6' },
      { id: 12, text: 'IBKR: Invest', priority: 'high', tag: 'Standard', date: 'Mar 5' },
    ],
  },
  {
    name: 'Career & Hiring', color: 'red', active: 3, done: 0,
    goals: [
      { id: 13, text: 'Career plan / See Hiring', priority: 'high', tag: 'Deep', date: 'Mar 5' },
      { id: 14, text: 'AE Hiring: On Fire', priority: 'high', tag: 'Deep', date: 'Mar 5' },
      { id: 15, text: 'AE Hiring: Alta', priority: 'high', tag: 'Deep', date: 'Mar 5' },
    ],
  },
  {
    name: 'Social & AI Skills', color: 'purple', active: 3, done: 0,
    goals: [
      { id: 16, text: 'Sunday Morning Chavruta', priority: 'high', tag: 'Standard', date: 'Mar 24' },
      { id: 17, text: 'Volunteer', priority: 'high', tag: 'Standard', date: 'Mar 25' },
      { id: 18, text: 'Floopify Coding', priority: 'medium', tag: 'Deep', date: 'Mar 5' },
    ],
  },
]

// ── HEALTH WEEKS ──
const healthWeeks = [
  { label: 'Feb 23', swims: 4, weights: 3, earned: 35, highlight: true },
  { label: 'Feb 16', swims: 5, weights: 3, earned: 40, highlight: false },
  { label: 'Feb 9', swims: 4, weights: 6, earned: 50, highlight: false },
  { label: 'Feb 2', swims: 5, weights: 5, earned: 50, highlight: false },
]

// ── WALLET EARNINGS ──
const walletEarnings = {
  total: 570,
  monthlyMax: 1200,
  breakdown: [
    { module: 'Daily Habits', icon: 'check', color: 'green', amount: 240, maxAmount: 240 },
    { module: 'Health / Strava', icon: 'activity', color: 'accent', amount: 240, maxAmount: 240 },
    { module: 'Goals', icon: 'target', color: 'purple', amount: 130, maxAmount: 240 },
    { module: 'Learning', icon: 'book', color: 'orange', amount: 0, maxAmount: 240 },
  ],
}

// ── LEGACY DATA (for subpages) ──
const initialHabits = habitCategories.flatMap(cat =>
  cat.habits.map(h => ({
    id: h.id, name: h.name, streak: h.done ? Math.floor(Math.random() * 20) + 1 : 0,
    completedToday: h.done,
    weekHistory: [true, true, false, true, true, h.done, false],
  }))
)

const initialGoals = goalGroups.flatMap(g =>
  g.goals.map(goal => ({
    id: goal.id, title: goal.text, description: goal.tag,
    progress: goal.priority === 'high' ? 60 : 30,
    column: 'in-progress',
  }))
)

const initialCourses = [
  { id: 1, title: 'React Advanced Patterns', category: 'Development', progress: 72, xp: 1440, totalLessons: 24, completedLessons: 17, image: '⚛️',
    lessons: [
      { id: 1, title: 'Compound Components', completed: true, duration: '15 min' },
      { id: 2, title: 'Render Props', completed: true, duration: '20 min' },
      { id: 3, title: 'Custom Hooks', completed: true, duration: '18 min' },
      { id: 4, title: 'Context API Deep Dive', completed: false, duration: '25 min' },
      { id: 5, title: 'Performance Optimization', completed: false, duration: '30 min' },
    ]},
  { id: 2, title: 'UI/UX Design Fundamentals', category: 'Design', progress: 45, xp: 900, totalLessons: 20, completedLessons: 9, image: '🎨',
    lessons: [
      { id: 1, title: 'Design Principles', completed: true, duration: '12 min' },
      { id: 2, title: 'Color Theory', completed: true, duration: '15 min' },
      { id: 3, title: 'Typography', completed: false, duration: '20 min' },
      { id: 4, title: 'Layout & Grid', completed: false, duration: '22 min' },
    ]},
  { id: 3, title: 'Startup Growth Strategy', category: 'Business', progress: 20, xp: 400, totalLessons: 18, completedLessons: 4, image: '📈',
    lessons: [
      { id: 1, title: 'Product-Market Fit', completed: true, duration: '18 min' },
      { id: 2, title: 'Growth Metrics', completed: false, duration: '20 min' },
      { id: 3, title: 'User Acquisition', completed: false, duration: '25 min' },
    ]},
  { id: 4, title: 'Prompt Engineering Mastery', category: 'AI', progress: 88, xp: 1760, totalLessons: 16, completedLessons: 14, image: '🤖',
    lessons: [
      { id: 1, title: 'Basics of Prompting', completed: true, duration: '10 min' },
      { id: 2, title: 'Chain of Thought', completed: true, duration: '15 min' },
      { id: 3, title: 'Few-Shot Learning', completed: true, duration: '18 min' },
      { id: 4, title: 'Advanced Techniques', completed: false, duration: '25 min' },
    ]},
  { id: 5, title: 'Node.js Microservices', category: 'Development', progress: 10, xp: 200, totalLessons: 22, completedLessons: 2, image: '🟢',
    lessons: [
      { id: 1, title: 'Microservices Architecture', completed: true, duration: '20 min' },
      { id: 2, title: 'Service Communication', completed: false, duration: '25 min' },
    ]},
  { id: 6, title: 'Data Visualization with D3', category: 'Design', progress: 55, xp: 1100, totalLessons: 20, completedLessons: 11, image: '📊',
    lessons: [
      { id: 1, title: 'SVG Basics', completed: true, duration: '12 min' },
      { id: 2, title: 'Scales & Axes', completed: true, duration: '18 min' },
      { id: 3, title: 'Animations', completed: false, duration: '22 min' },
    ]},
]

const transactions = [
  { id: 1, date: '2026-04-01', description: 'AAPL Dividend', category: 'Income', amount: 142.50 },
  { id: 2, date: '2026-04-01', description: 'ETF Purchase - VTI', category: 'Investment', amount: -2500.00 },
  { id: 3, date: '2026-03-30', description: 'BTC Purchase', category: 'Crypto', amount: -1000.00 },
  { id: 4, date: '2026-03-28', description: 'Freelance Payment', category: 'Income', amount: 3200.00 },
  { id: 5, date: '2026-03-25', description: 'TSLA Sale', category: 'Investment', amount: 4500.00 },
  { id: 6, date: '2026-03-22', description: 'SOL Staking Reward', category: 'Crypto', amount: 85.20 },
  { id: 7, date: '2026-03-20', description: 'Bond Interest', category: 'Income', amount: 220.00 },
  { id: 8, date: '2026-03-18', description: 'ETH Purchase', category: 'Crypto', amount: -1500.00 },
  { id: 9, date: '2026-03-15', description: 'Rent Payment', category: 'Expense', amount: -2100.00 },
  { id: 10, date: '2026-03-12', description: 'MSFT Dividend', category: 'Income', amount: 98.75 },
]

const walletTokens = [
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.4523, price: 68420.00, change24h: 2.4 },
  { symbol: 'ETH', name: 'Ethereum', balance: 3.215, price: 3845.00, change24h: -1.2 },
  { symbol: 'SOL', name: 'Solana', balance: 45.8, price: 178.50, change24h: 5.7 },
  { symbol: 'AVAX', name: 'Avalanche', balance: 120.0, price: 42.30, change24h: 3.1 },
  { symbol: 'LINK', name: 'Chainlink', balance: 250.0, price: 18.75, change24h: -0.8 },
  { symbol: 'DOT', name: 'Polkadot', balance: 300.0, price: 8.92, change24h: 1.5 },
]

export function AppProvider({ children }) {
  const [theme, setTheme] = useState('dark')
  const [habits, setHabits] = useState(initialHabits)
  const [goals, setGoals] = useState(initialGoals)
  const [courses] = useState(initialCourses)
  const [heatmapData] = useState(generateHeatmapData)
  const [notifications, setNotifications] = useState({
    email: true, push: true, weekly: false, achievements: true,
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // ── Strava state ──
  const [strava, setStrava] = useState({
    loading: false,
    error: null,
    lastSynced: null,
    activities: [],       // raw activities from API
    thisWeek: { swims: 0, weights: 0, other: 0, total: 0, earned: 0 },
    thisMonth: { swims: 0, weights: 0, other: 0, total: 0, earned: 0 },
    weeklyHistory: [],    // [{ label, swims, weights, earned, highlight }]
  })

  // Process raw Strava activities into weekly stats
  const processActivities = useCallback((activities) => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const RATE_PER_SESSION = 5

    let weekSwims = 0, weekWeights = 0, weekOther = 0
    let monthSwims = 0, monthWeights = 0, monthOther = 0

    // Bin activities into ISO weeks for history
    const weekBins = {}

    for (const act of activities) {
      const date = new Date(act.start_date || act.start_date_local)
      const type = (act.type || act.sport_type || '').toLowerCase()

      const isSwim = type === 'swim' || type === 'swimming'
      const isWeight = type === 'weighttraining' || type === 'weight_training' || type === 'crossfit'

      // This week
      if (date >= startOfWeek) {
        if (isSwim) weekSwims++
        else if (isWeight) weekWeights++
        else weekOther++
      }

      // This month
      if (date >= startOfMonth) {
        if (isSwim) monthSwims++
        else if (isWeight) monthWeights++
        else monthOther++
      }

      // Weekly history bin (Mon-based ISO week)
      const weekStart = new Date(date)
      const day = weekStart.getDay()
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1)
      weekStart.setDate(diff)
      weekStart.setHours(0, 0, 0, 0)
      const key = weekStart.toISOString().split('T')[0]

      if (!weekBins[key]) weekBins[key] = { swims: 0, weights: 0, other: 0 }
      if (isSwim) weekBins[key].swims++
      else if (isWeight) weekBins[key].weights++
      else weekBins[key].other++
    }

    // Build weekly history sorted newest first, up to 8 weeks
    const weeklyHistory = Object.entries(weekBins)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 8)
      .map(([dateStr, counts], i) => {
        const d = new Date(dateStr)
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const totalSessions = counts.swims + counts.weights + counts.other
        return {
          label,
          swims: counts.swims,
          weights: counts.weights,
          earned: totalSessions * RATE_PER_SESSION,
          highlight: i === 0,
        }
      })

    const weekTotal = weekSwims + weekWeights + weekOther
    const monthTotal = monthSwims + monthWeights + monthOther

    return {
      thisWeek: { swims: weekSwims, weights: weekWeights, other: weekOther, total: weekTotal, earned: weekTotal * RATE_PER_SESSION },
      thisMonth: { swims: monthSwims, weights: monthWeights, other: monthOther, total: monthTotal, earned: monthTotal * RATE_PER_SESSION },
      weeklyHistory,
    }
  }, [])

  const fetchStrava = useCallback(async () => {
    setStrava(prev => ({ ...prev, loading: true, error: null }))
    try {
      // Fetch last 60 days of activities
      const res = await fetch('/api/strava')
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `Strava API error ${res.status}`)
      }
      const activities = await res.json()
      const processed = processActivities(activities)

      setStrava(prev => ({
        ...prev,
        loading: false,
        lastSynced: new Date().toLocaleString(),
        activities,
        ...processed,
      }))
    } catch (err) {
      setStrava(prev => ({ ...prev, loading: false, error: err.message }))
    }
  }, [processActivities])

  // Auto-fetch Strava on mount
  useEffect(() => {
    fetchStrava()
  }, [fetchStrava])

  // Notion sync state
  const [notion, setNotion] = useState({
    connected: false, token: null, workspace: null, databases: [],
    mappings: { habits: '', goals: '', health: '', transactions: '', learning: '' },
    lastSynced: null, syncing: false, autoSync: false, syncLog: [],
  })

  const connectNotion = async (token) => {
    try {
      const res = await fetch('/api/notion/databases', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.success) {
        setNotion(prev => ({ ...prev, connected: true, token, workspace: { name: 'My Workspace', icon: '📒' }, databases: data.databases || [],
          syncLog: [{ type: 'success', message: `Connected. Found ${data.count} databases.`, timestamp: new Date().toLocaleString() }, ...prev.syncLog] }))
      }
    } catch {
      setNotion(prev => ({ ...prev, connected: true, token, workspace: { name: 'My Workspace', icon: '📒' },
        databases: [
          { id: 'db-habits-001', title: 'Daily Habits', icon: '✅', properties: ['Name', 'Completed', 'Date', 'Streak'] },
          { id: 'db-goals-002', title: 'Goals & OKRs', icon: '🎯', properties: ['Title', 'Status', 'Progress', 'Category'] },
          { id: 'db-health-003', title: 'Health Log', icon: '❤️', properties: ['Date', 'Sleep Score', 'Exercise', 'Nutrition', 'Hydration'] },
          { id: 'db-finance-004', title: 'Transactions', icon: '💰', properties: ['Description', 'Date', 'Category', 'Amount'] },
          { id: 'db-learn-005', title: 'Learning Tracker', icon: '📚', properties: ['Course', 'Progress', 'XP', 'Category'] },
        ],
        syncLog: [{ type: 'success', message: 'Connected (demo mode).', timestamp: new Date().toLocaleString() }, ...prev.syncLog] }))
    }
  }

  const disconnectNotion = () => {
    setNotion({ connected: false, token: null, workspace: null, databases: [],
      mappings: { habits: '', goals: '', health: '', transactions: '', learning: '' },
      lastSynced: null, syncing: false, autoSync: false,
      syncLog: [{ type: 'info', message: 'Disconnected.', timestamp: new Date().toLocaleString() }] })
  }

  const updateDatabaseMapping = (module, databaseId) => {
    setNotion(prev => ({ ...prev, mappings: { ...prev.mappings, [module]: databaseId },
      syncLog: [{ type: 'info', message: `Mapped ${module} to ${databaseId ? prev.databases.find(d => d.id === databaseId)?.title || databaseId : '(none)'}`, timestamp: new Date().toLocaleString() }, ...prev.syncLog] }))
  }

  const syncNow = async () => {
    setNotion(prev => ({ ...prev, syncing: true }))
    const mapped = Object.entries(notion.mappings).filter(([, id]) => id)
    if (mapped.length === 0) {
      setNotion(prev => ({ ...prev, syncing: false, syncLog: [{ type: 'error', message: 'No databases mapped.', timestamp: new Date().toLocaleString() }, ...prev.syncLog] }))
      return
    }
    const logs = mapped.map(([mod]) => ({ type: 'success', message: `Synced ${mod} → Notion`, timestamp: new Date().toLocaleString() }))
    await new Promise(r => setTimeout(r, 1200))
    setNotion(prev => ({ ...prev, syncing: false, lastSynced: new Date().toLocaleString(), syncLog: [...logs, ...prev.syncLog].slice(0, 50) }))
  }

  const toggleAutoSync = () => {
    setNotion(prev => ({ ...prev, autoSync: !prev.autoSync,
      syncLog: [{ type: 'info', message: `Auto-sync ${!prev.autoSync ? 'enabled' : 'disabled'}`, timestamp: new Date().toLocaleString() }, ...prev.syncLog] }))
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.documentElement.classList.toggle('light', next === 'light')
  }

  const toggleHabit = (id) => {
    setHabits(prev => prev.map(h =>
      h.id === id ? { ...h, completedToday: !h.completedToday, streak: !h.completedToday ? h.streak + 1 : Math.max(0, h.streak - 1) } : h
    ))
  }

  const addHabit = (name) => {
    setHabits(prev => [...prev, { id: Date.now(), name, streak: 0, completedToday: false, weekHistory: [false, false, false, false, false, false, false] }])
  }

  const moveGoal = (id, newColumn) => {
    setGoals(prev => prev.map(g =>
      g.id === id ? { ...g, column: newColumn, progress: newColumn === 'done' ? 100 : g.progress } : g
    ))
  }

  const addGoal = (title, description) => {
    setGoals(prev => [...prev, { id: Date.now(), title, description, progress: 0, column: 'todo' }])
  }

  const value = {
    theme, toggleTheme,
    habits, toggleHabit, addHabit,
    goals, moveGoal, addGoal,
    courses, heatmapData, transactions, walletTokens,
    notifications, setNotifications,
    sidebarCollapsed, setSidebarCollapsed,
    notion, connectNotion, disconnectNotion, updateDatabaseMapping, syncNow, toggleAutoSync,
    // Strava
    strava, fetchStrava,
    // Dashboard data
    habitCategories, goalGroups, healthWeeks, walletEarnings,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
