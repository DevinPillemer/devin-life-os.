import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight, CreditCard } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Screen } from '@/components/floopify/ObsidianShell'

const goals = [
  { label: 'Dining Out', value: 75, amount: '$750 / $1,000' },
  { label: 'Groceries', value: 40, amount: '$320 / $800' },
  { label: 'Savings Goal', value: 62, amount: '$3,100 / $5,000' }
]

const transactions = [
  { title: 'Starbucks Coffee', amount: '-$5.50', time: 'Today • 8:42 AM' },
  { title: 'Salary Deposit', amount: '+$4,200.00', time: 'Yesterday • 9:10 AM' }
]

export default function WalletDashboardPage() {
  return (
    <Screen title="Wallet Overview" subtitle="Budget health and recent movement" showTopBar>
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-primary/20 via-surface-lowest to-tertiary/10 p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-onsurface-variant">Total Balance</p>
                <p className="mt-3 font-heading text-4xl font-extrabold text-onsurface">$12,450.00</p>
                <p className="mt-2 text-sm text-primary">Available cash across all accounts</p>
              </div>
              <div className="rounded-3xl bg-surface-lowest/90 p-4 text-primary">
                <CreditCard className="h-7 w-7" />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="rounded-full px-6"><ArrowUpRight className="mr-2 h-4 w-4" />Send</Button>
              <Button variant="outline" className="rounded-full px-6"><ArrowDownLeft className="mr-2 h-4 w-4" />Receive</Button>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card className="h-full p-6">
            <p className="text-sm text-onsurface-variant">Recent Transactions</p>
            <div className="mt-4 space-y-3">
              {transactions.map((tx) => (
                <div key={tx.title} className="flex items-center justify-between rounded-2xl bg-surface-highest/15 px-4 py-3">
                  <div>
                    <p className="font-medium text-onsurface">{tx.title}</p>
                    <p className="text-xs text-onsurface-variant">{tx.time}</p>
                  </div>
                  <p className={`font-heading text-lg font-bold ${tx.amount.startsWith('+') ? 'text-primary' : 'text-tertiary'}`}>{tx.amount}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="mt-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-onsurface-variant">Budget Goals</p>
              <p className="mt-1 font-heading text-2xl font-bold">Keep spending aligned with the plan</p>
            </div>
          </div>
          <div className="mt-5 space-y-5">
            {goals.map((goal) => (
              <div key={goal.label}>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-onsurface">{goal.label}</p>
                    <p className="text-xs text-onsurface-variant">{goal.amount}</p>
                  </div>
                  <span className="text-sm text-primary">{goal.value}%</span>
                </div>
                <Progress value={goal.value} indicatorClassName={goal.label === 'Savings Goal' ? 'bg-tertiary' : ''} />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </Screen>
  )
}
