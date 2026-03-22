import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Screen } from '@/components/floopify/ObsidianShell'

const weeklyActivity = [
  { day: 'M', value: 40 },
  { day: 'T', value: 64 },
  { day: 'W', value: 52 },
  { day: 'T', value: 80 },
  { day: 'F', value: 68 },
  { day: 'S', value: 88 },
  { day: 'S', value: 56 }
]

const activity = [
  { label: 'Steps', value: '10,482' },
  { label: 'Calories Burned', value: '624 kcal' },
  { label: 'Active Minutes', value: '84 min' }
]

export default function HealthPage() {
  return (
    <Screen includeBottomTabs>
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 rounded-[28px] border border-outline/20 bg-emerald-panel p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-onsurface-variant">Health Metrics Overview</p>
            <h1 className="mt-2 font-heading text-4xl font-extrabold text-onsurface">Your health is trending strong.</h1>
          </div>
          <div className="rounded-3xl bg-surface-lowest/90 px-6 py-5 text-center">
            <p className="text-sm text-onsurface-variant">Health Score</p>
            <p className="mt-2 font-heading text-5xl font-extrabold text-primary">85</p>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="md:col-span-1">
            <Card className="h-full p-5">
              <p className="text-sm text-onsurface-variant">Sleep Quality</p>
              <p className="mt-2 font-heading text-3xl font-extrabold text-onsurface">Hours Slept: 7h 45m</p>
              <div className="mt-4 flex h-24 items-end gap-2">
                {[45, 55, 62, 58, 74, 78, 70].map((value, idx) => <div key={idx} className="flex-1 rounded-t-2xl bg-primary/80" style={{ height: `${value}%` }} />)}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-1">
            <Card className="h-full p-5">
              <p className="text-sm text-onsurface-variant">Exercise Stats</p>
              <div className="mt-4 grid gap-3">
                {activity.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-surface-highest/15 px-4 py-4">
                    <p className="text-xs text-onsurface-variant">{item.label}</p>
                    <p className="mt-2 font-heading text-2xl font-extrabold text-onsurface">{item.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="md:col-span-2 xl:col-span-1">
            <Card className="h-full p-5">
              <p className="text-sm text-onsurface-variant">Water Intake</p>
              <p className="mt-2 font-heading text-3xl font-extrabold text-onsurface">1.5L</p>
              <div className="mt-4">
                <Progress value={50} />
                <p className="mt-2 text-sm text-onsurface-variant">Halfway to your 3L daily target.</p>
              </div>
              <div className="mt-6 rounded-2xl bg-surface-highest/15 px-4 py-4">
                <p className="text-xs text-onsurface-variant">Heart Rate</p>
                <p className="mt-2 font-heading text-3xl font-extrabold text-tertiary">72 BPM</p>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-5">
              <p className="text-sm text-onsurface-variant">Weekly Activity</p>
              <div className="mt-5 flex h-64 items-end gap-3">
                {weeklyActivity.map((bar) => (
                  <div key={`${bar.day}-${bar.value}`} className="flex flex-1 flex-col items-center gap-3">
                    <div className="w-full rounded-t-[20px] bg-primary/90" style={{ height: `${bar.value}%` }} />
                    <span className="text-xs text-onsurface-variant">{bar.day}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
            <Card className="h-full p-5">
              <p className="text-sm text-onsurface-variant">Activity Breakdown</p>
              <div className="mt-4 space-y-4">
                {[
                  ['Mobility & recovery', '32 min'],
                  ['Strength session', '48 min'],
                  ['Outdoor walk', '6.8 km'],
                  ['Mindfulness', '15 min']
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl bg-surface-highest/15 px-4 py-3">
                    <p className="text-sm text-onsurface">{label}</p>
                    <p className="font-heading text-lg font-bold text-primary">{value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </Screen>
  )
}
