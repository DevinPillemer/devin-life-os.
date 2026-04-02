import { User, Sun, Moon, Bell, Download } from 'lucide-react'
import { useApp } from '../context/AppContext'

function Toggle({ checked, onChange }) {
  return (
    <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-white/10'}`}>
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}

export default function SettingsPage() {
  const { theme, toggleTheme, notifications, setNotifications } = useApp()

  const toggleNotif = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
            <User size={28} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-white">Floopify User</p>
            <p className="text-sm text-gray-400">user@floopify.app</p>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon size={18} className="text-accent" /> : <Sun size={18} className="text-warning" />}
            <div>
              <p className="text-sm font-medium text-white">Theme</p>
              <p className="text-xs text-gray-500">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
            </div>
          </div>
          <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Bell size={16} /> Notifications
        </h2>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
            { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
            { key: 'weekly', label: 'Weekly Summary', desc: 'Get a weekly progress report' },
            { key: 'achievements', label: 'Achievements', desc: 'Notify when you earn achievements' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <Toggle checked={notifications[item.key]} onChange={() => toggleNotif(item.key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Data</h2>
        <button className="bg-white/5 hover:bg-white/10 text-white font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-sm border border-border">
          <Download size={16} /> Export All Data
        </button>
        <p className="text-xs text-gray-500 mt-2">Download all your data as a JSON file</p>
      </div>
    </div>
  )
}
