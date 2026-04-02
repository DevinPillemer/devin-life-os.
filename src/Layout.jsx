import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CheckCircle2, Activity, Target, BookOpen,
  Wallet, BarChart2, Database, Settings, Menu, X, ExternalLink
} from 'lucide-react'
import FloopifyLogo from './components/FloopifyLogo'
import { useApp } from './context/AppContext'

const overviewItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
]

const moduleItems = [
  { to: '/habits', icon: CheckCircle2, label: 'Daily Habits', badge: '11/11' },
  { to: '/health', icon: Activity, label: 'Health', badge: 'Strava' },
  { to: '/goals', icon: Target, label: 'Goals', badge: '23' },
  { to: '/learning', icon: BookOpen, label: 'Learning' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/finance', icon: BarChart2, label: 'Finance' },
]

const systemItems = [
  { to: '/notion', icon: Database, label: 'Notion Sync' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const allItems = [...overviewItems, ...moduleItems, ...systemItems]

function NavSection({ label, items }) {
  return (
    <>
      <div className="px-5 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-faint">
        {label}
      </div>
      {items.map(({ to, icon: Icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 px-5 py-2 text-[13px] transition-all duration-150 relative ${
              isActive
                ? 'text-accent bg-accent-dim'
                : 'text-text-muted hover:bg-surface-2 hover:text-text'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent rounded-r" />
              )}
              <Icon size={15} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-surface-3 text-text-muted">
                  {badge}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </>
  )
}

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

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-bg">
        <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FloopifyLogo size={28} />
            <div>
              <div className="text-[15px] font-semibold text-text">Floopify</div>
            </div>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-text-muted">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>
        <main className="pt-16 pb-6 px-4">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-bg/95 backdrop-blur pt-16 px-4 overflow-y-auto">
            <NavSection label="Overview" items={overviewItems} />
            <NavSection label="Modules" items={moduleItems} />
            <NavSection label="System" items={systemItems} />
          </div>
        )}
      </div>
    )
  }

  // Desktop layout with sidebar
  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="w-[220px] flex-shrink-0 bg-surface border-r border-border flex flex-col sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 pb-6 pt-6 border-b border-border mb-1">
          <FloopifyLogo size={32} />
          <div>
            <div className="text-[15px] font-semibold tracking-tight text-text">Floopify</div>
            <div className="text-[11px] text-text-muted">Life OS</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1">
          <NavSection label="Overview" items={overviewItems} />
          <NavSection label="Modules" items={moduleItems} />
          <NavSection label="System" items={systemItems} />
        </nav>

        {/* Footer date */}
        <div className="p-5 border-t border-border">
          <div className="text-[11px] text-text-muted bg-surface-2 px-3 py-2 rounded-sm text-center">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green animate-pulse-dot mr-1.5 align-middle" />
            {dateStr}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 max-w-[1280px]">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
