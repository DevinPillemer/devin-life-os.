import { BarChart3, Banknote, CalendarDays, CircleDollarSign, PiggyBank, RefreshCw, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BUDGET_DATA } from '@/data/seedData'

// Google Sheets IDs from env vars
const PERSONAL_SHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_PERSONAL_ID
const FAMILY_SHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_FAMILY_ID

// Fetch published Google Sheet as JSON (sheet must be published to web)
// Sheet format expected:
//   Row 1: headers
//   Row 2+: key-value data rows with: month, income, charities, pension, hishtalmut, car_loan, apartment_loan,
//           investments, groceries, dining, transport, entertainment, shopping, health, subscriptions, misc,
//           net_savings, end_balance, w1_budget, w1_spent, w2_budget, w2_spent, w3_budget, w3_spent, w4_budget, w4_spent
async function fetchSheetData(sheetId) {
  if (!sheetId) return null
  try {
    // Use the sheets JSON export URL (gid=0 = first sheet)
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=0`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    // Google wraps the JSON in "google.visualization.Query.setResponse(...)"
    const text = await res.text()
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}') + 1
    if (jsonStart === -1) throw new Error('No JSON found in response')
    const json = JSON.parse(text.substring(jsonStart, jsonEnd))
    return json
  } catch (e) {
    throw new Error(`Sheet fetch failed: ${e.message}`)
  }
}

// Parse the Google Sheets gviz JSON into our BUDGET_DATA format
function parseSheetToBudgetData(gvizJson) {
  const cols = gvizJson?.table?.cols || []
  const rows = gvizJson?.table?.rows || []
  if (!rows.length) return null

  const headers = cols.map(c => (c.label || c.id || '').trim().toLowerCase())
  const getVal = (row, key) => {
    const idx = headers.indexOf(key)
    if (idx === -1) return 0
    const cell = row.c?.[idx]
    return cell?.v ?? cell?.f ?? 0
  }

  const result = {}
  for (const row of rows) {
    const month = getVal(row, 'month') || getVal(row, 'month_label')
    if (!month || month === 0) continue
    const monthKey = String(month)
    result[monthKey] = {
      income: Number(getVal(row, 'income')) || 0,
      charities: Number(getVal(row, 'charities')) || 0,
      transfers: {
        pension: Number(getVal(row, 'pension')) || 0,
        hishtalmut: Number(getVal(row, 'hishtalmut')) || 0,
      },
      loans: {
        car: Number(getVal(row, 'car_loan') || getVal(row, 'car')) || 0,
        apartment: Number(getVal(row, 'apartment_loan') || getVal(row, 'apartment')) || 0,
      },
      investments: Number(getVal(row, 'investments')) || 0,
      expenses: {
        Groceries: Number(getVal(row, 'groceries')) || 0,
        Dining: Number(getVal(row, 'dining')) || 0,
        Transport: Number(getVal(row, 'transport')) || 0,
        Entertainment: Number(getVal(row, 'entertainment')) || 0,
        Shopping: Number(getVal(row, 'shopping')) || 0,
        Health: Number(getVal(row, 'health_expenses') || getVal(row, 'health')) || 0,
        Subscriptions: Number(getVal(row, 'subscriptions')) || 0,
        Misc: Number(getVal(row, 'misc')) || 0,
      },
      netSavings: Number(getVal(row, 'net_savings')) || 0,
      endBalance: Number(getVal(row, 'end_balance')) || 0,
      weeks: [1, 2, 3, 4].map(n => {
        const budget = Number(getVal(row, `w${n}_budget`)) || 0
        const spent = Number(getVal(row, `w${n}_spent`)) || 0
        return { weekNum: n, budget, spent, onTrack: spent <= budget }
      })
    }
  }
  return Object.keys(result).length > 0 ? result : null
}

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

  const sheetId = dashboardType === 'family' ? FAMILY_SHEET_ID : PERSONAL_SHEET_ID
  const [sheetData, setSheetData] = useState(null)
  const [loadingSheet, setLoadingSheet] = useState(false)
  const [sheetError, setSheetError] = useState(null)

  useEffect(() => {
    if (!sheetId) {
      setSheetData(null)
      setSheetError(null)
      setLoadingSheet(false)
      return
    }
    setLoadingSheet(true)
    setSheetError(null)
    fetchSheetData(sheetId)
      .then(raw => {
        const parsed = parseSheetToBudgetData(raw)
        if (parsed) {
          setSheetData(parsed)
          setSheetError(null)
        } else {
          setSheetError('Sheet loaded but no valid rows found. Check column headers match expected format.')
        }
      })
      .catch(e => setSheetError(e.message))
      .finally(() => setLoadingSheet(false))
  }, [sheetId, dashboardType])

  const budgetData = sheetData || BUDGET_DATA
  const isLive = !!sheetData
  const months = Object.keys(budgetData)
  const selectedMonth = searchParams.get('month') && budgetData[searchParams.get('month')]
    ? searchParams.get('month')
    : months[months.length - 1] || months[0]
  const monthData = budgetData[selectedMonth]

  const totals = useMemo(() => {
    if (!monthData) return {}
    const fixedDeductions = (monthData.charities || 0)
      + (monthData.transfers?.pension || 0)
      + (monthData.transfers?.hishtalmut || 0)
      + (monthData.loans?.car || 0)
      + (monthData.loans?.apartment || 0)
      + (monthData.investments || 0)
    const variableTotal = Object.values(monthData.expenses || {}).reduce((sum, val) => sum + Number(val || 0), 0)
    const completedWeeks = (monthData.weeks || []).filter(w => w.onTrack).length
    const incentiveValue = Math.min(200, completedWeeks * 50) + 40
    return { fixedDeductions, variableTotal, completedWeeks, incentiveValue }
  }, [monthData])

  const handleMonthChange = month => setSearchParams({ type: dashboardType, month })

  const handleTabChange = type => setSearchParams({ type })

  const handleRefresh = () => {
    if (!sheetId) return
    setLoadingSheet(true)
    setSheetError(null)
    fetchSheetData(sheetId)
      .then(raw => {
        const parsed = parseSheetToBudgetData(raw)
        if (parsed) setSheetData(parsed)
        else setSheetError('No valid rows found after refresh.')
      })
      .catch(e => setSheetError(e.message))
      .finally(() => setLoadingSheet(false))
  }

  if (!monthData) {
    return <div className="p-8 text-slate-400">No budget data available.</div>
  }

  return (
    <div className="space-y-6 rounded-xl bg-slate-950 p-4 text-white">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">
            Finance Dashboard • {dashboardType === 'family' ? 'Family' : 'Personal'}
          </h2>
          <p className="text-sm text-slate-400">
            {isLive
              ? <span className="text-emerald-400">● Live from Google Sheets</span>
              : sheetId
                ? loadingSheet
                  ? <span className="text-amber-400">Loading sheet...</span>
                  : <span className="text-red-400">● Sheet error — showing seed data</span>
                : <span className="text-slate-500">No sheet connected — showing seed data</span>
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Personal / Family tabs */}
          <div className="flex rounded-lg border border-slate-700 overflow-hidden">
            <button
              onClick={() => handleTabChange('personal')}
              className={`px-3 py-1.5 text-sm ${dashboardType === 'personal' ? 'bg-teal-500/20 text-teal-300 border-r border-slate-700' : 'text-slate-400 hover:bg-slate-800 border-r border-slate-700'}`}
            >Personal</button>
            <button
              onClick={() => handleTabChange('family')}
              className={`px-3 py-1.5 text-sm ${dashboardType === 'family' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:bg-slate-800'}`}
            >Family</button>
          </div>
          {sheetId && (
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loadingSheet} className="gap-1 border-slate-700 text-slate-300 hover:bg-slate-800">
              <RefreshCw size={14} className={loadingSheet ? 'animate-spin' : ''} />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Sheet connection notice */}
      {!sheetId && (
        <Card className="border border-amber-600/30 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-300">Google Sheet not connected</p>
              <p className="text-xs text-slate-400 mt-1">
                Add <code className="text-amber-200 bg-slate-800 px-1 rounded">{dashboardType === 'family' ? 'VITE_GOOGLE_SHEETS_FAMILY_ID' : 'VITE_GOOGLE_SHEETS_PERSONAL_ID'}</code> to your Vercel environment variables to sync live data.
                Currently showing example seed data.
              </p>
            </div>
          </div>
        </Card>
      )}

      {sheetError && (
        <Card className="border border-red-600/30 bg-red-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-300">Sheet sync error</p>
              <p className="text-xs text-slate-400 mt-1">{sheetError}</p>
              <p className="text-xs text-slate-500 mt-1">Showing seed data instead. Make sure the sheet is published: File → Share → Publish to web.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Month selector */}
      <div className="flex flex-wrap gap-2">
        {months.map(month => (
          <button
            key={month}
            type="button"
            onClick={() => handleMonthChange(month)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${selectedMonth === month
              ? 'border-teal-500 bg-teal-500/20 text-teal-200'
              : 'border-slate-800 bg-slate-900/60 text-slate-300'}`}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={CircleDollarSign} label="Income" value={`₪${monthData.income?.toLocaleString()}`} tone="text-emerald-300" />
        <SummaryCard icon={TrendingDown} label="Fixed Deductions" value={`₪${totals.fixedDeductions?.toLocaleString()}`} tone="text-red-300" />
        <SummaryCard icon={BarChart3} label="Variable Expenses" value={`₪${totals.variableTotal?.toLocaleString()}`} tone="text-cyan-300" />
        <SummaryCard icon={PiggyBank} label="Net Savings" value={`₪${monthData.netSavings?.toLocaleString()}`} tone="text-teal-300" />
      </div>

      {/* Breakdowns */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-slate-200"><Banknote size={16}/> Fixed deductions</div>
          <p className="text-sm text-slate-300">Charities: ₪{monthData.charities?.toLocaleString()}</p>
          <p className="text-sm text-slate-300">Pension: ₪{monthData.transfers?.pension?.toLocaleString()} • Hishtalmut: ₪{monthData.transfers?.hishtalmut?.toLocaleString()}</p>
          <p className="text-sm text-slate-300">Car loan: ₪{monthData.loans?.car?.toLocaleString()} • Apartment: ₪{monthData.loans?.apartment?.toLocaleString()}</p>
          <p className="text-sm text-slate-300">Investments: ₪{monthData.investments?.toLocaleString()}</p>
          <p className="text-sm text-white font-medium">End balance: ₪{monthData.endBalance?.toLocaleString()}</p>
        </Card>
        <Card className="space-y-3 border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-slate-200"><TrendingUp size={16}/> Variable expenses</div>
          {Object.entries(monthData.expenses || {}).map(([label, amount]) => (
            <ExpenseRow
              key={label}
              label={label}
              amount={Number(amount)}
              percent={totals.variableTotal > 0 ? Math.round((Number(amount) / totals.variableTotal) * 100) : 0}
            />
          ))}
        </Card>
      </div>

      {/* Weekly tracker */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Weekly budget tracker</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {(monthData.weeks || []).map(week => (
            <Card key={week.weekNum} className="space-y-2 border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Week {week.weekNum}</p>
                <span className={`rounded-full px-2 py-1 text-xs ${week.onTrack ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                  {week.onTrack ? 'On track' : 'Over budget'}
                </span>
              </div>
              <p className="text-sm text-slate-300">Budget: ₪{week.budget?.toLocaleString()}</p>
              <p className="text-sm text-slate-300">Spent: ₪{week.spent?.toLocaleString()}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Incentive */}
      <Card className="space-y-2 border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center gap-2 text-slate-200"><CalendarDays size={16}/> Incentive</div>
        <p className="text-sm text-slate-300">Completed budget weeks: {totals.completedWeeks} × ₪50</p>
        <p className="text-sm text-slate-300">Payout cap: ₪200 base + ₪40 accelerator</p>
        <p className="text-lg font-semibold text-teal-300">Total payout: ₪{totals.incentiveValue}</p>
      </Card>
    </div>
  )
}
