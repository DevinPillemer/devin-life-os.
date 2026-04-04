"use client";

import { useState } from "react";
import {
  Clock,
  CheckCircle2,
  Coins,
  Activity,
  Target,
  PenTool,
  TrendingUp,
  Flame,
  ChevronDown,
} from "lucide-react";

interface ActivityItem {
  id: number;
  action: string;
  type: string;
  time: string;
  icon: string;
}

interface Props {
  activities: ActivityItem[];
  loading: boolean;
}

const activityIcons: Record<string, React.ReactNode> = {
  "check-circle": <CheckCircle2 size={14} className="text-accent" />,
  coins: <Coins size={14} className="text-gold" />,
  activity: <Activity size={14} className="text-emerald-400" />,
  target: <Target size={14} className="text-violet-400" />,
  "pen-tool": <PenTool size={14} className="text-blue-400" />,
  "trending-up": <TrendingUp size={14} className="text-gold" />,
  flame: <Flame size={14} className="text-orange-400" />,
};

function getTimeBlock(time: string): string {
  const hour = parseInt(time.split(":")[0]);
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

export default function ActivityFeed({ activities, loading }: Props) {
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
        <div className="w-32 h-4 skeleton rounded mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 skeleton rounded" />
          ))}
        </div>
      </div>
    );
  }

  const visible = showAll ? activities : activities.slice(0, 10);

  // Group by time block
  const groups: Record<string, ActivityItem[]> = {};
  for (const a of visible) {
    const block = getTimeBlock(a.time);
    if (!groups[block]) groups[block] = [];
    groups[block].push(a);
  }

  const blockOrder = ["Morning", "Afternoon", "Evening"];

  return (
    <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Clock size={14} className="text-slate-400" />
        Recent Activity
      </h2>

      <div className="space-y-3">
        {blockOrder.map((block) => {
          const items = groups[block];
          if (!items || items.length === 0) return null;

          return (
            <div key={block}>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1.5 pl-1">
                {block}
              </div>
              <div className="space-y-0.5">
                {items.map((a, i) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-700/20 transition-colors animate-slide-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex-shrink-0">
                      {activityIcons[a.icon] || <Activity size={14} className="text-slate-400" />}
                    </div>
                    <span className="text-sm text-slate-300 flex-1 truncate">{a.action}</span>
                    <span className="text-[10px] text-slate-500 flex-shrink-0 tabular-nums">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {activities.length > 10 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 w-full py-2 text-xs text-slate-400 hover:text-slate-300 transition-colors flex items-center justify-center gap-1 rounded-lg hover:bg-slate-700/20"
        >
          Show more <ChevronDown size={12} />
        </button>
      )}
    </div>
  );
}
