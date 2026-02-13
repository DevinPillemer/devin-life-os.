import StatsCards from '@/components/dashboard/StatsCards'
export default function ProgressPage(){return <div className="space-y-4"><h2 className="text-2xl font-bold">Overall Progress</h2><StatsCards stats={[{label:'Learning',value:'65%'},{label:'Habits',value:'88%'},{label:'Health',value:'80%'},{label:'Wallet',value:'₪949'}]} /></div>}
