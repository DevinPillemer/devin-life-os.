import { useSearchParams } from 'react-router-dom'
import BudgetTracker from '@/components/finance/BudgetTracker'
import TransactionList from '@/components/finance/TransactionList'
import BudgetCheckTracker from '@/components/finance/BudgetCheckTracker'

const transactions=[{date:'2026-02-01',category:'Food',amount:120},{date:'2026-02-02',category:'Transport',amount:35}]

export default function FinancialDashboardsPage(){const [params]=useSearchParams(); const type=params.get('type')||'personal'; return <div className="space-y-4"><h2 className="text-2xl font-bold capitalize">{type} Finance Dashboard</h2><BudgetTracker/><BudgetCheckTracker/><div className="card p-4"><TransactionList transactions={transactions}/></div><p>Reward model: ₪50 per completed week, accelerator ₪40.</p></div>}
