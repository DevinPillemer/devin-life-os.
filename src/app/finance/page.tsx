"use client";


import useSWR from "swr";
import { useSearchParams } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function Money({ value }: { value: number }) {
  return <span className="tabular-nums">₪{Math.round(value || 0).toLocaleString()}</span>;
}

function BudgetCard({ title, data, openSheet }: { title: string; data: any; openSheet: string }) {
  return (
    <div className="rounded-xl bg-surface border border-slate-700/50 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <a className="text-sm text-cyan-300 hover:text-cyan-200" href={openSheet} target="_blank" rel="noreferrer">Open Sheet</a>
      </div>
      <p className="text-xs text-slate-400">{data?.monthLabel} · {data?.billingPeriod}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg bg-slate-900/60 p-3"><div className="text-xs text-slate-400">Total Income</div><div className="text-lg text-white font-semibold"><Money value={data?.totalIncome} /></div></div>
        <div className="rounded-lg bg-slate-900/60 p-3"><div className="text-xs text-slate-400">Total Expenses</div><div className="text-lg text-white font-semibold"><Money value={data?.totalExpenses} /></div></div>
        <div className="rounded-lg bg-slate-900/60 p-3"><div className="text-xs text-slate-400">End Balance</div><div className="text-lg text-white font-semibold"><Money value={data?.endBalance} /></div></div>
        <div className="rounded-lg bg-emerald-900/30 p-3 border border-emerald-500/30"><div className="text-xs text-emerald-200">Live Bank Balance (Actual)</div><div className="text-lg text-emerald-100 font-semibold"><Money value={data?.liveBankBalanceActual} /></div></div>
      </div>

      {!!data?.ccExpenses?.length && (
        <div>
          <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-2">CC Expenses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.ccExpenses.filter((x: any) => x.value > 0).map((item: any) => (
              <div key={item.label} className="text-sm flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-300">{item.label}</span>
                <span className="text-white"><Money value={item.value} /></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FinancePage() {
  const params = useSearchParams();
  const month = params.get("month");
  const type = params.get("type");
  const query = new URLSearchParams();
  if (month) query.set("month", month);
  if (type) query.set("type", type);
  const apiUrl = `/api/finance${query.toString() ? `?${query.toString()}` : ""}`;
  const { data, isLoading } = useSWR(apiUrl, fetcher);

  if (isLoading) return <div className="p-6 text-slate-300">Loading finance…</div>;

  return (
    <main className="min-h-screen bg-surface-dark p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">Floopify Finance</h1>
      <p className="text-sm text-slate-400">
        Viewing: {type || "all"} {month ? `· month ${month}` : "· latest month"}
      </p>
      <BudgetCard title="Personal" data={data?.personal} openSheet={data?.openSheetLinks?.personal} />
      <BudgetCard title="Family" data={data?.family} openSheet={data?.openSheetLinks?.family} />
    </main>
  );
}
