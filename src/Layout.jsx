import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, CheckSquare, Heart, Target, DollarSign, Wallet, BookOpen, Settings, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import FloopifyLogo from './components/FloopifyLogo'
import { useApp } from './context/AppContext'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/habits', icon: CheckSquare, label: 'Habits' },
  { to: '/health', icon: Heart, label: 'Health' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/finance', icon: DollarSign, label: 'Finance' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/learning', icon: BookOpen, label: 'Learning' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const { sidebarCollapsed, setSidebarCollapsed } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const linkClass = (isActive) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
      isActive
        ? 'bg-accent/10 text-accent'
        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
    }`

  // Mobile bottom tab bar
  if (isMobile) {
    return (
      <div className="min-h-screen bg-bg">
        <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FloopifyLogo size={28} />
            <span className="font-bold text-lg text-white">Floopify</span>
          </div>
        </header>
        <main className="pt-16 pb-20 px-4">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border">
          <div className="flex justify-around py-2">
            {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition-colors ${isActive ? 'text-accent' : 'text-gray-500'}`
              }>
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] text-gray-500">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              More
            </button>
          </div>
        </nav>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-bg/95 backdrop-blur pt-16 pb-20 px-6">
            <div className="flex flex-col gap-2 mt-4">
              {navItems.slice(5).map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} className={({ isActive }) => linkClass(isActive)}>
                  <Icon size={20} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop sidebar
  return (
    <div className="min-h-screen bg-bg flex">
      <aside className={`fixed top-0 left-0 h-full z-40 bg-card border-r border-border transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-56'}`}>
        <div className={`flex items-center gap-2 p-4 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <FloopifyLogo size={28} />
          {!sidebarCollapsed && <span className="font-bold text-lg text-white">Floopify</span>}
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => linkClass(isActive)} title={sidebarCollapsed ? label : undefined}>
              <Icon size={20} className="flex-shrink-0" />
              {!sidebarCollapsed && label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-3 border-t border-border text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
