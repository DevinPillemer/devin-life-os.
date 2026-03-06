import { NavLink, Outlet } from 'react-router-dom'
import { Wallet, BookOpen, Repeat, HeartPulse, Target, Landmark, LayoutDashboard } from 'lucide-react'

const nav = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/walletdashboard', label: 'Wallet', icon: Wallet },
  { to: '/learning', label: 'Learning', icon: BookOpen },
  { to: '/dailyhabits', label: 'Daily Habits', icon: Repeat },
  { to: '/health', label: 'Health', icon: HeartPulse },
  { to: '/goalstracker', label: 'Goals', icon: Target }
]

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-background text-gray-100">
      <aside className="w-64 border-r border-border/50 bg-[#080C18] p-5 flex flex-col">
        <h1 className="mb-8 text-xl font-bold text-primary tracking-tight">Floopify</h1>
        <div className="space-y-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-light hover:text-white hover:bg-white/5'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-border/30">
          <p className="text-xs text-muted mb-2 px-3">Finance</p>
          <NavLink to="/financialdashboards?type=personal" className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-light hover:text-white hover:bg-white/5'}`}>
            <Landmark size={18} />
            Personal
          </NavLink>
          <NavLink to="/financialdashboards?type=family" className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-light hover:text-white hover:bg-white/5'}`}>
            <Landmark size={18} />
            Family
          </NavLink>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto"><Outlet /></main>
    </div>
  )
}
