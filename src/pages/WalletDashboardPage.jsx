import { Progress } from '@/components/ui/progress'
import SectionBreakdown from '@/components/wallet/SectionBreakdown'
import EarningsHistory from '@/components/wallet/EarningsHistory'

export default function WalletDashboardPage(){const total=949; return <div className="space-y-4"><h2 className="text-3xl font-bold">Your Wallet</h2><div className="card p-4"><p>Monthly Budget: ₪1,000 base + ₪200 accelerators</p><Progress value={(total/1200)*100}/><p className="mt-2">Total: ₪{total}/₪1,200</p></div><SectionBreakdown/><div className="card p-4"><EarningsHistory/></div></div>}
