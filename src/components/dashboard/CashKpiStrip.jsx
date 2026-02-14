import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Progress } from "@/components/ui/progress";
import { Wallet, Coins, CalendarDays, Zap } from "lucide-react";

// New incentive structure: 10 shekels per milestone, 200 base + 40 accelerator
const MILESTONE_REWARD = 10;
const MAX_MILESTONES_PER_MONTH = 20;
const MONTHLY_BASE_CAP = 200;
const MONTHLY_ACCELERATOR_BONUS = 40;
const MONTHLY_MAX_CAP = 240;

function monthBounds(d = new Date()) {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  first.setHours(0,0,0,0);
  last.setHours(23,59,59,999);
  return { first, last };
}
function weekBounds(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(date); monday.setDate(date.getDate() - diffToMonday); monday.setHours(0,0,0,0);
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); sunday.setHours(23,59,59,999);
  return { monday, sunday };
}

export default function CashKpiStrip() {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState([]);
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const ec = await base44.entities.EarnedCredit.filter({ source: "learning" });
      const wt = await base44.entities.WalletTransaction.list("-date", 200);
      setCredits(ec || []);
      setTxs(wt || []);
    })();
  }, []);

  const { monday, sunday } = useMemo(() => weekBounds(new Date()), []);
  const { first: monthStart, last: monthEnd } = useMemo(() => monthBounds(new Date()), []);

  // Count milestones this month (each EarnedCredit entry = 1 milestone)
  const monthlyCredits = useMemo(() => {
    return credits.filter(c => {
      const cd = new Date(c.date);
      return cd >= monthStart && cd <= monthEnd && (!user || c.created_by === user.email);
    });
  }, [credits, monthStart, monthEnd, user]);
  
  const milestonesThisMonth = monthlyCredits.length;
  const baseEarned = Math.min(MONTHLY_BASE_CAP, milestonesThisMonth * MILESTONE_REWARD);
  
  // Check for accelerator: 7-day learning streak or perfect quiz scores
  // For now, we'll check if user has credits on 7 consecutive days this month
  const hasLearningStreak = useMemo(() => {
    if (monthlyCredits.length < 7) return false;
    const dates = [...new Set(monthlyCredits.map(c => new Date(c.date).toDateString()))].sort();
    // Check for any 7 consecutive days
    for (let i = 0; i <= dates.length - 7; i++) {
      let consecutive = true;
      for (let j = 1; j < 7; j++) {
        const d1 = new Date(dates[i + j - 1]);
        const d2 = new Date(dates[i + j]);
        const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
        if (diff !== 1) {
          consecutive = false;
          break;
        }
      }
      if (consecutive) return true;
    }
    return false;
  }, [monthlyCredits]);
  
  const acceleratorEarned = hasLearningStreak ? MONTHLY_ACCELERATOR_BONUS : 0;
  const totalEarned = baseEarned + acceleratorEarned;
  
  const redeemedThisMonth = txs.filter(t => {
    const td = new Date(t.date);
    return td >= monthStart && td <= monthEnd && t.type === "redemption" && (!user || t.created_by === user.email);
  }).reduce((s, t) => s + Math.abs(t.amount_shekels || 0), 0);
  
  const monthlyShekelsNet = Math.max(0, totalEarned - redeemedThisMonth);
  const progressPct = Math.min(100, (baseEarned / MONTHLY_BASE_CAP) * 100);

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-700/80 p-6 mb-8 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400">Learning Section: ₪200 + ₪40</span>
        {acceleratorEarned > 0 && (
          <div className="flex items-center gap-1 bg-amber-600/20 border border-amber-600/30 rounded-lg px-2 py-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">7-Day Streak! +₪40</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-slate-300">Base Earned</span>
          </div>
          <div className="text-2xl font-bold text-emerald-300">₪{baseEarned} / 200</div>
          <div className="text-xs text-slate-500">{milestonesThisMonth} / {MAX_MILESTONES_PER_MONTH} milestones</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-slate-300">Total (with Accelerator)</span>
          </div>
          <div className="text-2xl font-bold text-yellow-300">₪{totalEarned} / 240</div>
          <div className="text-xs text-slate-500">{acceleratorEarned > 0 ? 'Accelerator earned!' : '7-day streak for +₪40'}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CalendarDays className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-300">Monthly Progress</span>
          </div>
          <div className="px-4">
            <Progress value={progressPct} className="h-2 bg-slate-700/60" indicatorClassName="bg-blue-500" />
          </div>
          <div className="text-xs text-slate-500 mt-1">₪10 per milestone</div>
        </div>
      </div>
    </div>
  );
}
