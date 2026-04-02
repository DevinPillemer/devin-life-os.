import { useState } from 'react'
import { TrendingUp, TrendingDown, Search, DollarSign, PieChart } from 'lucide-react'
import AnimatedCounter from '../components/AnimatedCounter'
import { useApp } from '../context/AppContext'

function DonutChart() {
  const segments = [
    { label: 'Stocks', value: 45, color: '#00d4aa' },
    { label: 'Crypto', value: 25, color: '#7c3aed' },
    { label: 'Cash', value: 15, color: '#3b82f6' },
    { label: 'Real Estate', value: 15, color: '#f59e0b' },
  ]

  const size = 200
  const cx = size / 2
  const cy = size / 2
  const radius = 70
  const innerRadius = 45
  let cumulativeAngle = -90

  const paths = segments.map(seg => {
    const startAngle = cumulativeAngle
    const sweepAngle = (seg.value / 100) * 360
    cumulativeAngle += sweepAngle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = ((startAngle + sweepAngle) * Math.PI) / 180

    const x1 = cx + radius * Math.cos(startRad)
    const y1 = cy + radius * Math.sin(startRad)
    const x2 = cx + radius * Math.cos(endRad)
    const y2 = cy + radius * Math.sin(endRad)
    const ix1 = cx + innerRadius * Math.cos(endRad)
    const iy1 = cy + innerRadius * Math.sin(endRad)
    const ix2 = cx + innerRadius * Math.cos(startRad)
    const iy2 = cy + innerRadius * Math.sin(startRad)

    const largeArc = sweepAngle > 180 ? 1 : 0

    const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2} Z`

    return { ...seg, d }
  })

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {paths.map((seg, i) => (
          <path key={i} d={seg.d} fill={seg.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">$284,750</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#6b7280" fontSize="10">Total Value</text>
      </svg>
      <div className="flex flex-wrap gap-3 justify-center">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-gray-400">{seg.label} {seg.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function FinancialDashboardPage() {
  const { transactions } = useApp()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  const categories = ['All', ...new Set(transactions.map(t => t.category))]
  const filtered = transactions.filter(t => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'All' || t.category === categoryFilter
    return matchSearch && matchCategory
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Financial Dashboard</h1>
        <p className="text-gray-400 mt-1">Your portfolio and transactions overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-accent" />
            <span className="text-sm text-gray-400">Total Value</span>
          </div>
          <p className="text-2xl font-bold text-white"><AnimatedCounter end={284750} prefix="$" /></p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-emerald-400" />
            <span className="text-sm text-gray-400">Daily Change</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">+$1,247.30</p>
          <p className="text-xs text-emerald-400/70 mt-1">+0.44%</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <PieChart size={18} className="text-secondary" />
            <span className="text-sm text-gray-400">Assets</span>
          </div>
          <p className="text-2xl font-bold text-white">12</p>
          <p className="text-xs text-gray-500 mt-1">Across 4 categories</p>
        </div>
      </div>

      {/* Donut Chart + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Asset Allocation</h3>
          <DonutChart />
        </div>
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Transaction History</h3>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..."
                className="w-full bg-white/5 border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent/50" />
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/50 appearance-none">
              {categories.map(c => <option key={c} value={c} className="bg-card">{c}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-border">
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Description</th>
                  <th className="text-left py-2 font-medium">Category</th>
                  <th className="text-right py-2 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="py-3 text-gray-400">{t.date}</td>
                    <td className="py-3 text-white">{t.description}</td>
                    <td className="py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{t.category}</span>
                    </td>
                    <td className={`py-3 text-right font-medium ${t.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.amount >= 0 ? '+' : ''}{t.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
