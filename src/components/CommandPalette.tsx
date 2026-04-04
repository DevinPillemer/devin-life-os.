"use client";

import { useEffect, useState, useRef } from "react";
import { Search, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SECTIONS = [
  { id: "kpi", label: "KPI Cards", icon: "📊" },
  { id: "calendar", label: "Calendar", icon: "📅" },
  { id: "habits", label: "Habits", icon: "✅" },
  { id: "finance", label: "Finance", icon: "💰" },
  { id: "health", label: "Health", icon: "🏃" },
  { id: "goals", label: "Goals", icon: "🎯" },
  { id: "activity", label: "Activity Feed", icon: "⚡" },
];

export default function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = SECTIONS.filter(
    (s) => s.label.toLowerCase().includes(query.toLowerCase())
  );

  const navigate = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] cmd-palette-overlay bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to section..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && filtered.length > 0) {
                navigate(filtered[0].id);
              }
            }}
          />
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-4">No matches</div>
          ) : (
            filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(s.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors text-left"
              >
                <span className="text-base">{s.icon}</span>
                <span className="text-sm text-slate-300">{s.label}</span>
                <span className="ml-auto text-[10px] text-slate-500">↵ to jump</span>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-slate-700 flex items-center gap-4 text-[10px] text-slate-500">
          <span>↑↓ Navigate</span>
          <span>↵ Jump</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
