import { Table } from '@/components/ui/table'
export default function TransactionList({ transactions }) { return <Table headers={['Date','Category','Amount']} rows={transactions.map(t=>[t.date,t.category,`₪${t.amount}`])} /> }
