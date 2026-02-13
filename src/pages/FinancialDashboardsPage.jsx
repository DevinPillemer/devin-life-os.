import { BarChart3, Banknote, CalendarDays, CircleDollarSign, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { BUDGET_DATA } from '@/data/seedData'

function SummaryCard({ icon: Icon, label, value, tone = 'text-white' }) {
  return (
    <Card className="space-y-2 border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between text-slate-300">
        <span className="text-sm">{label}</span>
        <Icon size={16} />
      </div>
      <p className={`text-2xl font-semibold ${tone}`}>{value}</p>
    </Card>
  )
}

function ExpenseRow({ label, amount, percent }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-medium text-white">₪{amount.toLocaleString()} • {percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full bg-cyan-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export default function FinancialDashboardsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const dashboardType = searchParams.get('type') === 'family' ? 'family' : 'personal'
  const months = Object.keys(BUDGET_DATA)
  const selectedMonth = searchParams.get('month') && BUDGET_DATA[searchParams.get('month')] ? searchParams.get('month') : months[0]
  const monthData = BUDGET_DATA[selectedMonth]

  const totals = useMemo(() => {
    const fixedDeductions =
      monthData.charities +
      monthData.transfers.pension +
      monthData.transfers.hishtalmut +
      monthData.loans.car +
      monthData.loans.apartment +
      monthData.investments

    const variableTotal = Object.values(monthData.expenses).reduce((sum, val) => sum + val, 0)
    const completedWeeks = monthData.weeks.filter(week => week.onTrack).length
    const incentiveValue = Math.min(200, completedWeeks * 50) + 40

    return { fixedDeductions, variableTotal, completedWeeks, incentiveValue }
  }, [monthData])

  const handleMonthChange = month => {
    setSearchParams({ type: dashboardType, month })
  }

  return <div className="space-y-6 rounded-xl bg-slate-950 p-4 text-white">
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Finance Dashboard • {dashboardType === 'family' ? 'Family' : 'Personal'}</h2>
      <p className="text-sm text-slate-300">Real monthly budget tracking, expense mix, and incentive payout view.</p>
    </div>

    <div className="flex flex-wrap gap-2">
      {months.map(month => (
        <button
          key={month}
          type="button"
          onClick={() => handleMonthChange(month)}
          className={`rounded-lg border px-3 py-1.5 text-sm ${selectedMonth === month ? 'border-teal-500 bg-teal-500/20 text-teal-200' : 'border-slate-800 bg-slate-900/60 text-slate-300'}`}
        >
          {month}
        </button>
      ))}
    </div>

    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard icon={CircleDollarSign} label="Income" value={`₪${monthData.income.toLocaleString()}`} tone="text-emerald-300" />
      <SummaryCard icon={TrendingDown} label="Fixed Deductions" value={`₪${totals.fixedDeductions.toLocaleString()}`} tone="text-red-300" />
      <SummaryCard icon={BarChart3} label="Variable Expenses" value={`₪${totals.variableTotal.toLocaleString()}`} tone="text-cyan-300" />
      <SummaryCard icon={PiggyBank} label="Net Savings" value={`₪${monthData.netSavings.toLocaleString()}`} tone="text-teal-300" />
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="space-y-3 border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center gap-2 text-slate-200"><Banknote size={16}/> Fixed deductions</div>
        <p className="text-sm text-slate-300">Charities: ₪{monthData.charities.toLocaleString()}</p>
        <p className="text-sm text-slate-300">Transfers: Pension ₪{monthData.transfers.pension.toLocaleString()} • Hishtalmut ₪{monthData.transfers.hishtalmut.toLocaleString()}</p>
        <p className="text-sm text-slate-300">Loans: Car ₪{monthData.loans.car.toLocaleString()} • Apartment ₪{monthData.loans.apartment.toLocaleString()}</p>
        <p className="text-sm text-slate-300">Investments: ₪{monthData.investments.toLocaleString()}</p>
        <p className="text-sm text-white">End balance projection: ₪{monthData.endBalance.toLocaleString()}</p>
      </Card>

      <Card className="space-y-3 border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center gap-2 text-slate-200"><TrendingUp size={16}/> Variable expenses</div>
        {Object.entries(monthData.expenses).map(([label, amount]) => (
          <ExpenseRow
            key={label}
            label={label}
            amount={amount}
            percent={Math.round((amount / totals.variableTotal) * 100)}
          />
        ))}
      </Card>
    </div>

    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Weekly budget tracker</h3>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {monthData.weeks.map(week => (
          <Card key={week.weekNum} className="space-y-2 border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">Week {week.weekNum}</p>
              <span className={`rounded-full px-2 py-1 text-xs ${week.onTrack ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                {week.onTrack ? 'On track' : 'Over budget'}
              </span>
            </div>
            <p className="text-sm text-slate-300">Budget: ₪{week.budget.toLocaleString()}</p>
            <p className="text-sm text-slate-300">Spent: ₪{week.spent.toLocaleString()}</p>
          </Card>
        ))}
      </div>
    </section>

    <Card className="space-y-2 border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center gap-2 text-slate-200"><CalendarDays size={16}/> Incentive</div>
      <p className="text-sm text-slate-300">Completed budget weeks: {totals.completedWeeks} × ₪50</p>
      <p className="text-sm text-slate-300">Payout cap: ₪200 base + ₪40 accelerator</p>
      <p className="text-lg font-semibold text-teal-300">Total payout: ₪{totals.incentiveValue}</p>
    </Card>
  </div>
}
