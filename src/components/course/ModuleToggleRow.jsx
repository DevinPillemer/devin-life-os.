import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Circle, ArrowRight, Coins } from "lucide-react";

export default function ModuleToggleRow({
  index,
  title,
  done,
  reward,
  onToggle,
  onOpen,
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${done ? "bg-emerald-500/15 border border-emerald-400/30" : "bg-slate-700/60 border border-slate-600/70"}`}>
          {done ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-slate-400" />}
        </div>
        <div>
          <div className="text-slate-100 font-medium">{index + 1}. {title}</div>
          <div className="text-xs text-slate-400">Module {index + 1}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge className="bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
          <Coins className="w-3.5 h-3.5 mr-1" />
          +₪{Number(reward).toFixed(2)}
        </Badge>

        <Switch checked={!!done} onCheckedChange={(v) => onToggle(v)} />

        {onOpen && (
          <Button variant="outline" size="sm" onClick={onOpen} className="border-slate-600 text-slate-200 hover:bg-slate-700/60">
            Open <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
