import { Outlet } from 'react-router-dom'
import { SidebarNavigation } from '@/components/floopify/ObsidianShell'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-background text-onsurface dark">
      <SidebarNavigation />
      <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-5">
        <Outlet />
      </main>
    </div>
  )
}
