import { NavLink, Outlet } from 'react-router-dom'
import { Wallet, BookOpen, Repeat, HeartPulse, Target, Landmark } from 'lucide-react'

const nav = [
  { to: '/walletdashboard', label: 'Wallet', icon: Wallet },
  { to: '/dashboard', label: 'Learning', icon: BookOpen },
  { to: '/dailyhabits', label: 'Daily Habits', icon: Repeat },
  { to: '/health', label: 'Health', icon: HeartPulse },
  { to: '/goalstracker', label: 'Goals', icon: Target }
]

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <aside className="w-72 border-r border-gray-800 bg-gray-900 p-4">
        <h1 className="mb-4 text-2xl font-bold text-teal-400">Floopify</h1>
        <div className="space-y-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 ${isActive ? 'bg-teal-500 text-gray-950' : 'hover:bg-gray-800'}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
          <div className="pt-2 text-sm text-gray-400">Finance</div>
          <NavLink to="/financialdashboards?type=personal" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-800"><Landmark size={18}/>Personal</NavLink>
          <NavLink to="/financialdashboards?type=family" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-800"><Landmark size={18}/>Family</NavLink>
        </div>
      </aside>
      <main className="flex-1 p-6"><Outlet /></main>
    </div>
  )
}
