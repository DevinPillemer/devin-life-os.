import { Button } from '@/components/ui/button'
import StatHeader from '@/components/health/StatHeader'
import PerformanceCards from '@/components/health/PerformanceCards'
import IncentiveTable from '@/components/health/IncentiveTable'
import WeekTimeline from '@/components/health/WeekTimeline'

export default function HealthPage(){return <div className="space-y-4"><div className="flex justify-between"><h2 className="text-2xl font-bold">Health</h2><Button>Sync Google Sheet</Button></div><StatHeader/><PerformanceCards/><div className="card p-4"><IncentiveTable/></div><WeekTimeline/><div className="card p-4">ISO week summary (Mon-Sun) with Jan 4 anchor implemented in data utils.</div></div>}
