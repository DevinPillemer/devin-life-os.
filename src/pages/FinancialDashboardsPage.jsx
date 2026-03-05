import { BarChart3, Banknote, CalendarDays, CircleDollarSign, PiggyBank, RefreshCw, TrendingDown, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Both sheets live in the same spreadsheet
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_PERSONAL_ID

// Sheet names within the spreadsheet
const SHEET_NAMES = {
  personal: 'Devin Budget',
  family: 'Joint Budget'
}

// Row label => what key we store it under
// PERSONAL sheet row labels
const PERSONAL_ROW_MAP = {
  'TOTAL INCOME': 'income',
  'TOTAL CHARITIES': 'charities',
  'TOTAL CONTRIBUTION': 'joint_transfer',   // transfers row
  'TOTAL AMOUNT': 'loans',                   // loans
  'TOTAL CONTRIBUTION_2': 'investments',     // second TOTAL CONTRIBUTION = investments
  'TOTAL EXPENSES': 'expenses_total',
  'Opening balance': 'opening',
  'Current Balance (End of Month)': 'end_balance',
  'Net Operating (Savings / Loss)': 'net_savings',
  // expense line items
  'Gyms': 'exp_gym',
  'Food Shopping': 'exp_food',
  'Eating Out': 'exp_eating_out',
  'Self Spend (Luxuries)': 'exp_luxuries',
  'Baby / Kids': 'exp_baby',
  'Transportation (Car/Gas/GETT/Pango)': 'exp_transport',
  'Medical / Health': 'exp_medical',
  'Travel / Events': 'exp_travel',
  'SaaS Subscriptions (AI)': 'exp_saas',
  'Miscellaneous / Other': 'exp_misc',
  'Bike / Mobility': 'exp_bike',
  'Alcohol / Booze': 'exp_alcohol',
}

// FAMILY sheet row labels
const FAMILY_ROW_MAP = {
  'TOTAL': 'joint_total',                    // Joint contributions total
  'Devin': 'devin_contrib',
  'Daphna': 'daphna_contrib',
  'Current Balance (End of Month)': 'end_balance',
  'Net Operating (Savings / Loss)': 'net_savings',
  'Opening balance': 'opening',
  'Total Income': 'rental_income',
  'Total Expenses ': 'expenses_total',
  'Rent': 'rent',
  'Gan (Kindergarten)': 'gan',
  'Joint Contribution': 'joint_contrib',
  'Mortgage ': 'mortgage',
  'Savings Contribution': 'savings',
  // expense lines
  'Gym ': 'exp_gym',
  'Groceries & Food Shopping': 'exp_groceries',
  'Eating Out ': 'exp_eating_out',
  'Utilities & Services': 'exp_utilities',
  'Transportation': 'exp_transport',
  'Insurance': 'exp_insurance',
  'Shopping & Retail': 'exp_shopping',
  'Online Purchases (Temu)': 'exp_online',
  'Medical / Health': 'exp_medical',
  'Baby / Kids': 'exp_baby',
  'Entertainment': 'exp_entertainment',
  'Cleaning ': 'exp_cleaning',
}

// Parse the column-based sheet into month objects
// Structure: Col A = row labels, Col B+ = month columns
// Row 0 = first data row (no header row - month labels are in col headers from gviz)
async function fetchAndParseSheet(sheetId, sheetName) {
  if (!sheetId) return null
  const encodedName = encodeURIComponent(sheetName)
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodedName}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${sheetName}`)
  const text = await res.text()
  const start = text.indexOf('(') + 1
  const end = text.lastIndexOf(')')
  const json = JSON.parse(text.substring(start, end))
  const cols = json.table.cols || []
  const rows = json.table.rows || []

  // Col 0 = row label (A), Col 1+ = month data (B, C, D...)
  // Month labels come from the column headers (c.label)
  const months = cols.slice(1).map(c => {
    const raw = (c.label || c.id || '').trim()
    return raw
  }).filter(m => m && m.match(/[A-Za-z]+-\d{2}/))

  // Build a map: monthLabel => { rowLabel: numericValue }
  const monthData = {}
  for (let ci = 0; ci < months.length; ci++) {
    const monthLabel = months[ci]
    const colIdx = ci + 1 // col 0 is label col
    const data = {}
    let totContribCount = 0 // track duplicate "TOTAL CONTRIBUTION" rows
    for (const row of rows) {
      const cells = row.c || []
      const labelRaw = cells[0]?.f || cells[0]?.v || ''
      const label = String(labelRaw).trim()
      if (!label || label === '') continue
      const cellVal = cells[colIdx]
      const raw = cellVal?.v ?? 0
      const num = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^\d.-]/g, '')) || 0

      // Handle duplicate TOTAL CONTRIBUTION (first = transfers, second = investments)
      if (label === 'TOTAL CONTRIBUTION') {
        totContribCount++
        if (totContribCount === 1) data['joint_transfer'] = num
        else data['investments'] = num
        continue
      }
      // Handle duplicate TOTAL (joint budget)
      if (label === 'TOTAL') {
        if (!data['joint_total']) data['joint_total'] = num
        continue
      }

      // Try matching label to our map
      const key = (sheetName === 'Devin Budget' ? PERSONAL_ROW_MAP : FAMILY_ROW_MAP)[label]
      if (key) data[key] = num
    }
    if (Object.keys(data).length > 2) {
      monthData[monthLabel] = data
    }
  }
  return monthData
}

function formatNIS(val) {
  if (val == null || val === '') return '₪0'
  const n = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^\d.-]/g, '')) || 0
  const abs = Math.abs(n)
  const str = abs.toLocaleString()
  return (n < 0 ? '-' : '') + '₪' + str
}

function SummaryCard({ icon: Icon, label, value, tone = 'text-white', sub }) {
  return (
    <Card className="space-y-1 border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-xs uppercase tracking-wide font-medium">{label}</span>
        <Icon size={14} />
      </div>
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </Card>
  )
}

function ExpenseRow({ label, amount, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((Math.abs(amount) / total) * 100)) : 0
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-medium text-white">{formatNIS(amount)} <span className="text-slate-500 text-xs">{pct}%</span></span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function FinancialDashboardsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const dashboardType = searchParams.get('type') === 'family' ? 'family' : 'personal'

  const [sheetData, setSheetData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)

  const loadSheet = async (type) => {
    if (!SHEET_ID) {
      setError('Sheet ID not configured')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const sheetName = SHEET_NAMES[type]
      const data = await fetchAndParseSheet(SHEET_ID, sheetName)
      if (!data || Object.keys(data).length === 0) {
        throw new Error(`No months found in ${sheetName}. Make sure the sheet is published (File → Share → Publish to web).`)
      }
      setSheetData({ type, data })
      setLastFetch(new Date())
    } catch (e) {
      setError(e.message)
      setSheetData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSheet(dashboardType)
  }, [dashboardType])

  const months = sheetData?.data ? Object.keys(sheetData.data) : []
  const selectedMonth = searchParams.get('month') && sheetData?.data?.[searchParams.get('month')]
    ? searchParams.get('month')
    : months[months.length - 1] || ''

  const monthData = sheetData?.data?.[selectedMonth] || null
  const isFamily = dashboardType === 'family'

  // Compute expense breakdown
  const expenseKeys = isFamily
    ? ['exp_gym','exp_groceries','exp_eating_out','exp_utilities','exp_transport','exp_insurance','exp_shopping','exp_online','exp_medical','exp_baby','exp_entertainment','exp_cleaning']
    : ['exp_gym','exp_food','exp_eating_out','exp_luxuries','exp_baby','exp_transport','exp_medical','exp_travel','exp_saas','exp_misc','exp_bike','exp_alcohol']

  const expenseLabels = isFamily
    ? ['Gym','Groceries & Food','Eating Out','Utilities','Transport','Insurance','Shopping','Online (Temu)','Medical','Baby/Kids','Entertainment','Cleaning']
    : ['Gym','Food Shopping','Eating Out','Luxuries','Baby/Kids','Transport','Medical','Travel/Events','SaaS/AI','Misc','Bike','Alcohol']

  const expTotal = monthData ? expenseKeys.reduce((s, k) => s + (monthData[k] || 0), 0) : 0

  const handleTabChange = (type) => setSearchParams({ type })
  const handleMonthChange = (m) => setSearchParams({ type: dashboardType, month: m })

  return (
    <div className="space-y-5 rounded-xl bg-slate-950 p-4 text-white">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold">
            Finance • {isFamily ? 'Family (Joint)' : 'Personal (Devin)'}
          </h2>
          <p className="text-xs text-slate-400">
            {loading && <span className="text-amber-400">Loading from Google Sheets...</span>}
            {!loading && sheetData && <span className="text-emerald-400">● Live — last fetched {lastFetch?.toLocaleTimeString()}</span>}
            {!loading && error && <span className="text-red-400">● Error — {error.substring(0, 60)}</span>}
            {!loading && !sheetData && !error && <span className="text-slate-500">No data loaded</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg border border-slate-700 overflow-hidden text-sm">
            <button onClick={() => handleTabChange('personal')} className={`px-3 py-1.5 ${!isFamily ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:bg-slate-800'} border-r border-slate-700`}>Personal</button>
            <button onClick={() => handleTabChange('family')} className={`px-3 py-1.5 ${isFamily ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:bg-slate-800'}`}>Family</button>
          </div>
          <Button variant="outline" size="sm" onClick={() => loadSheet(dashboardType)} disabled={loading} className="gap-1 border-slate-700 text-slate-300 hover:bg-slate-800 text-xs">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Sync
          </Button>
          <a href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300">
            <ArrowUpRight size={12}/> Open Sheet
          </a>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="border border-red-600/30 bg-red-500/5 p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-300">Could not load sheet</p>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
            <p className="text-xs text-slate-500 mt-1">Make sure the sheet is published: File → Share → Publish to web → select "Entire Document" → Publish.</p>
          </div>
        </Card>
      )}

      {/* Month selector */}
      {months.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {months.map(m => (
            <button key={m} onClick={() => handleMonthChange(m)}
              className={`rounded-lg border px-3 py-1 text-sm ${selectedMonth === m ? 'border-teal-500 bg-teal-500/20 text-teal-200' : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'}`}>
              {m}
            </button>
          ))}
        </div>
      )}

      {monthData && (
        <>
          {/* Summary cards */}
          {isFamily ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard icon={CircleDollarSign} label="Joint Contributions" value={formatNIS(monthData.joint_total || (monthData.devin_contrib || 0) + (monthData.daphna_contrib || 0))} tone="text-emerald-300"
                sub={`Devin: ${formatNIS(monthData.devin_contrib)} • Daphna: ${formatNIS(monthData.daphna_contrib)}`} />
              <SummaryCard icon={TrendingDown} label="Total Expenses" value={formatNIS(monthData.expenses_total || expTotal)} tone="text-red-300" />
              <SummaryCard icon={Banknote} label="Fixed (Rent+Gan+Mort)" value={formatNIS((monthData.rent||0)+(monthData.gan||0)+(monthData.mortgage||0))} tone="text-orange-300" />
              <SummaryCard icon={PiggyBank} label="Net (End Balance)" value={formatNIS(monthData.end_balance)} tone={monthData.end_balance > 0 ? 'text-teal-300' : 'text-red-300'}
                sub={`Net: ${formatNIS(monthData.net_savings)}`} />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard icon={CircleDollarSign} label="Total Income" value={formatNIS(monthData.income)} tone="text-emerald-300" />
              <SummaryCard icon={TrendingDown} label="Total Expenses" value={formatNIS(monthData.expenses_total || expTotal)} tone="text-red-300" />
              <SummaryCard icon={Banknote} label="Loans + Investments" value={formatNIS((monthData.loans||0)+(monthData.investments||0))} tone="text-orange-300"
                sub={`Loans: ${formatNIS(monthData.loans)} • Invest: ${formatNIS(monthData.investments)}`} />
              <SummaryCard icon={PiggyBank} label="End Balance" value={formatNIS(monthData.end_balance)} tone={monthData.end_balance > 0 ? 'text-teal-300' : 'text-red-300'}
                sub={`Net: ${formatNIS(monthData.net_savings)}`} />
            </div>
          )}

          {/* Two column detail */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Fixed costs */}
            <Card className="border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                <Banknote size={15}/> Fixed &amp; Transfers
              </div>
              {isFamily ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Rent</span><span className="text-white font-medium">{formatNIS(monthData.rent)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Gan / Kindergarten</span><span className="text-white font-medium">{formatNIS(monthData.gan)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Mortgage</span><span className="text-white font-medium">{formatNIS(monthData.mortgage)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Savings</span><span className="text-white font-medium">{formatNIS(monthData.savings)}</span></div>
                  <div className="flex justify-between pt-1 border-t border-slate-800"><span className="text-slate-300 font-medium">Rental Income</span><span className="text-emerald-300 font-medium">{formatNIS(monthData.rental_income)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-300 font-medium">Opening Balance</span><span className="text-slate-200 font-medium">{formatNIS(monthData.opening)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-300 font-bold">End Balance</span><span className={`font-bold ${(monthData.end_balance||0) >= 0 ? 'text-teal-300' : 'text-red-300'}`}>{formatNIS(monthData.end_balance)}</span></div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Charities</span><span className="text-white font-medium">{formatNIS(monthData.charities)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Joint Transfer</span><span className="text-white font-medium">{formatNIS(monthData.joint_transfer)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Loans (Mom)</span><span className="text-white font-medium">{formatNIS(monthData.loans)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Investments (IBKR)</span><span className="text-white font-medium">{formatNIS(monthData.investments)}</span></div>
                  <div className="flex justify-between pt-1 border-t border-slate-800"><span className="text-slate-300 font-medium">Opening Balance</span><span className="text-slate-200 font-medium">{formatNIS(monthData.opening)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-300 font-bold">End Balance</span><span className={`font-bold ${(monthData.end_balance||0) >= 0 ? 'text-teal-300' : 'text-red-300'}`}>{formatNIS(monthData.end_balance)}</span></div>
                </div>
              )}
            </Card>

            {/* Expense breakdown */}
            <Card className="border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                  <TrendingUp size={15}/> Variable Expenses
                </div>
                <span className="text-xs text-slate-400">Total: {formatNIS(monthData.expenses_total || expTotal)}</span>
              </div>
              <div className="space-y-2">
                {expenseKeys.map((key, i) => {
                  const val = monthData[key] || 0
                  if (!val) return null
                  return <ExpenseRow key={key} label={expenseLabels[i]} amount={val} total={monthData.expenses_total || expTotal} />
                })}
              </div>
            </Card>
          </div>

          {/* Net summary bar */}
          <Card className="border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
                <CalendarDays size={15}/> Month Summary
              </div>
              <span className={`text-sm font-bold ${(monthData.net_savings||0) >= 0 ? 'text-teal-300' : 'text-red-300'}`}>
                Net: {formatNIS(monthData.net_savings)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
                <p className="text-xs text-slate-500 mb-1">Income / Contributions</p>
                <p className="font-bold text-emerald-300">{formatNIS(isFamily ? (monthData.joint_total || 0) + (monthData.rental_income || 0) : monthData.income)}</p>
              </div>
              <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
                <p className="text-xs text-slate-500 mb-1">All Outflows</p>
                <p className="font-bold text-red-300">{formatNIS((monthData.expenses_total||expTotal) + (isFamily ? (monthData.rent||0)+(monthData.gan||0)+(monthData.mortgage||0) : (monthData.charities||0)+(monthData.joint_transfer||0)+(monthData.loans||0)+(monthData.investments||0)))}</p>
              </div>
              <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
                <p className="text-xs text-slate-500 mb-1">Closing Balance</p>
                <p className={`font-bold ${(monthData.end_balance||0) >= 0 ? 'text-teal-300' : 'text-red-300'}`}>{formatNIS(monthData.end_balance)}</p>
              </div>
            </div>
          </Card>
        </>
      )}

      {!monthData && !loading && !error && (
        <Card className="border border-slate-700 bg-slate-900/40 p-8 text-center">
          <p className="text-slate-400">Click Sync to load data from Google Sheets</p>
        </Card>
      )}
    </div>
  )
}
