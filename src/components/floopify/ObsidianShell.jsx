import { NavLink, useLocation } from 'react-router-dom'
import { Bell, BookOpen, LayoutGrid, UserRound, WalletCards } from 'lucide-react'

const sidebarItems = [
  { to: '/home', label: 'Home', icon: 'home' },
  { to: '/walletdashboard', label: 'Wallet', icon: 'account_balance_wallet' },
  { to: '/learning', label: 'Learning', icon: 'school' },
  { to: '/dailyhabits', label: 'Daily Habits', icon: 'routine' },
  { to: '/health', label: 'Health', icon: 'monitor_heart' },
  { to: '/goalstracker', label: 'Goals', icon: 'flag' },
  { to: '/financialdashboards?type=personal', label: 'Personal', icon: 'person' },
  { to: '/financialdashboards?type=family', label: 'Family', icon: 'groups' }
]

const bottomItems = [
  { to: '/home', label: 'Home', icon: LayoutGrid },
  { to: '/walletdashboard', label: 'Wallet', icon: WalletCards },
  { to: '/learning', label: 'Learn', icon: BookOpen },
  { to: '/dailyhabits', label: 'Habits', icon: LayoutGrid },
  { to: '/health', label: 'Profile', icon: UserRound }
]

export function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-[0_0_30px_rgba(87,241,219,0.18)]">
        <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
      </div>
      <div>
        <p className="font-heading text-xl font-extrabold tracking-tight text-primary">Floopify</p>
        <p className="text-xs text-onsurface-variant">Obsidian Emerald</p>
      </div>
    </div>
  )
}

export function SidebarNavigation() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-outline/15 bg-surface-lowest/95 px-5 py-6 lg:flex lg:flex-col">
      <AppLogo />
      <div className="mt-8 space-y-2">
        {sidebarItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(87,241,219,0.15)]' : 'text-onsurface-variant hover:bg-surface-highest/20 hover:text-onsurface'}`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  )
}

export function TopBar({ title = 'Floopify', subtitle }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="lg:hidden">
        <AppLogo />
      </div>
      <div className="hidden lg:block">
        <h1 className="font-heading text-2xl font-bold text-onsurface">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-onsurface-variant">{subtitle}</p> : null}
      </div>
      <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-outline/20 bg-surface-highest/15 text-primary">
        <Bell className="h-5 w-5" />
      </button>
    </div>
  )
}

export function BottomTabBar() {
  const location = useLocation()
  return (
    <div className="sticky bottom-4 z-20 mt-6 lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-2 rounded-[28px] border border-outline/20 bg-surface-lowest/95 p-2 shadow-card backdrop-blur">
        {bottomItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] ${active ? 'bg-primary/15 text-primary' : 'text-onsurface-variant'}`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}

export function Screen({ children, title, subtitle, showTopBar = false, includeBottomTabs = false }) {
  return (
    <div className="min-h-full rounded-[32px] bg-emerald-soft p-4 sm:p-6 lg:p-8">
      {showTopBar ? <TopBar title={title} subtitle={subtitle} /> : null}
      {children}
      {includeBottomTabs ? <BottomTabBar /> : null}
    </div>
  )
}


export default Screen
