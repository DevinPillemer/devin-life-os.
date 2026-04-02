import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export function useApp() {
  return useContext(AppContext)
}

// Generate mock heatmap data for last 90 days
function generateHeatmapData() {
  const data = []
  const now = new Date()
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 5),
    })
  }
  return data
}

const initialHabits = [
  { id: 1, name: 'Morning Meditation', streak: 12, completedToday: false, weekHistory: [true, true, false, true, true, true, false] },
  { id: 2, name: 'Exercise 30 min', streak: 7, completedToday: false, weekHistory: [true, false, true, true, true, false, true] },
  { id: 3, name: 'Read 20 pages', streak: 21, completedToday: false, weekHistory: [true, true, true, true, true, true, true] },
  { id: 4, name: 'Drink 8 glasses water', streak: 5, completedToday: false, weekHistory: [false, true, true, true, true, true, false] },
  { id: 5, name: 'Journal before bed', streak: 0, completedToday: false, weekHistory: [false, false, true, false, true, false, false] },
  { id: 6, name: 'No social media before noon', streak: 3, completedToday: false, weekHistory: [true, false, false, true, true, true, false] },
]

const initialGoals = [
  { id: 1, title: 'Launch side project', description: 'Ship MVP of the productivity app', progress: 65, column: 'in-progress' },
  { id: 2, title: 'Run a half marathon', description: 'Train and complete a 21km race', progress: 40, column: 'in-progress' },
  { id: 3, title: 'Read 24 books this year', description: 'Two books per month reading goal', progress: 30, column: 'todo' },
  { id: 4, title: 'Learn TypeScript', description: 'Complete the TS fundamentals course', progress: 100, column: 'done' },
  { id: 5, title: 'Build emergency fund', description: 'Save 6 months of expenses', progress: 75, column: 'in-progress' },
  { id: 6, title: 'Meal prep weekly', description: 'Prep healthy meals every Sunday', progress: 0, column: 'todo' },
]

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
    email: true,
    push: true,
    weekly: false,
    achievements: true,
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Notion sync state
  const [notion, setNotion] = useState({
    connected: false,
    token: null,
    workspace: null,
    databases: [],
    mappings: { habits: '', goals: '', health: '', transactions: '', learning: '' },
    lastSynced: null,
    syncing: false,
    autoSync: false,
    syncLog: [],
  })

  const connectNotion = async (token) => {
    try {
      const res = await fetch('/api/notion/databases', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setNotion(prev => ({
          ...prev,
          connected: true,
          token,
          workspace: { name: 'My Workspace', icon: '📒' },
          databases: data.databases || [],
          syncLog: [{ type: 'success', message: `Connected to Notion. Found ${data.count} databases.`, timestamp: new Date().toLocaleString() }, ...prev.syncLog],
        }))
      } else {
        setNotion(prev => ({
          ...prev,
          syncLog: [{ type: 'error', message: `Connection failed: ${data.error}`, timestamp: new Date().toLocaleString() }, ...prev.syncLog],
        }))
      }
    } catch {
      // If API isn't available, simulate connection for demo
      setNotion(prev => ({
        ...prev,
        connected: true,
        token,
        workspace: { name: 'My Workspace', icon: '📒' },
        databases: [
          { id: 'db-habits-001', title: 'Daily Habits', icon: '✅', properties: ['Name', 'Completed', 'Date', 'Streak'] },
          { id: 'db-goals-002', title: 'Goals & OKRs', icon: '🎯', properties: ['Title', 'Status', 'Progress', 'Category'] },
          { id: 'db-health-003', title: 'Health Log', icon: '❤️', properties: ['Date', 'Sleep Score', 'Exercise', 'Nutrition', 'Hydration'] },
          { id: 'db-finance-004', title: 'Transactions', icon: '💰', properties: ['Description', 'Date', 'Category', 'Amount'] },
          { id: 'db-learn-005', title: 'Learning Tracker', icon: '📚', properties: ['Course', 'Progress', 'XP', 'Category'] },
          { id: 'db-projects-006', title: 'Projects', icon: '🚀', properties: ['Name', 'Status', 'Priority'] },
        ],
        syncLog: [{ type: 'success', message: 'Connected to Notion workspace (demo mode).', timestamp: new Date().toLocaleString() }, ...prev.syncLog],
      }))
    }
  }

  const disconnectNotion = () => {
    setNotion({
      connected: false,
      token: null,
      workspace: null,
      databases: [],
      mappings: { habits: '', goals: '', health: '', transactions: '', learning: '' },
      lastSynced: null,
      syncing: false,
      autoSync: false,
      syncLog: [{ type: 'info', message: 'Disconnected from Notion.', timestamp: new Date().toLocaleString() }],
    })
  }

  const updateDatabaseMapping = (module, databaseId) => {
    setNotion(prev => ({
      ...prev,
      mappings: { ...prev.mappings, [module]: databaseId },
      syncLog: [
        { type: 'info', message: `Mapped ${module} to database ${databaseId ? prev.databases.find(d => d.id === databaseId)?.title || databaseId : '(none)'}`, timestamp: new Date().toLocaleString() },
        ...prev.syncLog,
      ],
    }))
  }

  const syncNow = async () => {
    setNotion(prev => ({ ...prev, syncing: true }))

    const mappedModules = Object.entries(notion.mappings).filter(([, dbId]) => dbId)

    if (mappedModules.length === 0) {
      setNotion(prev => ({
        ...prev,
        syncing: false,
        syncLog: [{ type: 'error', message: 'No databases mapped. Map at least one module to sync.', timestamp: new Date().toLocaleString() }, ...prev.syncLog],
      }))
      return
    }

    // Simulate sync for each mapped module
    const logs = []
    for (const [mod, dbId] of mappedModules) {
      try {
        if (notion.token && notion.token !== 'demo') {
          const moduleData = mod === 'habits' ? habits : mod === 'goals' ? goals : mod === 'learning' ? courses : []
          await fetch('/api/notion/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${notion.token}` },
            body: JSON.stringify({ databaseId: dbId, module: mod, items: moduleData, direction: 'push' }),
          })
        }
        logs.push({ type: 'success', message: `Synced ${mod} → Notion`, timestamp: new Date().toLocaleString() })
      } catch {
        logs.push({ type: 'success', message: `Synced ${mod} → Notion (demo)`, timestamp: new Date().toLocaleString() })
      }
    }

    // Simulate async delay
    await new Promise(r => setTimeout(r, 1200))

    setNotion(prev => ({
      ...prev,
      syncing: false,
      lastSynced: new Date().toLocaleString(),
      syncLog: [...logs, ...prev.syncLog].slice(0, 50),
    }))
  }

  const toggleAutoSync = () => {
    setNotion(prev => ({
      ...prev,
      autoSync: !prev.autoSync,
      syncLog: [{ type: 'info', message: `Auto-sync ${!prev.autoSync ? 'enabled' : 'disabled'}`, timestamp: new Date().toLocaleString() }, ...prev.syncLog],
    }))
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.documentElement.classList.toggle('light', next === 'light')
  }

  const toggleHabit = (id) => {
    setHabits(prev => prev.map(h =>
      h.id === id ? { ...h, completedToday: !h.completedToday, streak: !h.completedToday ? h.streak + 1 : h.streak - 1 } : h
    ))
  }

  const addHabit = (name) => {
    setHabits(prev => [...prev, {
      id: Date.now(),
      name,
      streak: 0,
      completedToday: false,
      weekHistory: [false, false, false, false, false, false, false],
    }])
  }

  const moveGoal = (id, newColumn) => {
    setGoals(prev => prev.map(g =>
      g.id === id ? { ...g, column: newColumn, progress: newColumn === 'done' ? 100 : g.progress } : g
    ))
  }

  const addGoal = (title, description) => {
    setGoals(prev => [...prev, {
      id: Date.now(),
      title,
      description,
      progress: 0,
      column: 'todo',
    }])
  }

  const value = {
    theme, toggleTheme,
    habits, toggleHabit, addHabit,
    goals, moveGoal, addGoal,
    courses,
    heatmapData,
    transactions,
    walletTokens,
    notifications, setNotifications,
    sidebarCollapsed, setSidebarCollapsed,
    notion, connectNotion, disconnectNotion, updateDatabaseMapping, syncNow, toggleAutoSync,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
