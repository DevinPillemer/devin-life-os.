"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

interface CalendarEvent {
  title: string;
  start: string;
  end: string;
  color: string;
}

interface Props {
  events: CalendarEvent[];
  loading: boolean;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToLeft(minutes: number, startHour: number, endHour: number): number {
  const totalRange = (endHour - startHour) * 60;
  const offset = minutes - startHour * 60;
  return Math.max(0, Math.min(100, (offset / totalRange) * 100));
}

export default function CalendarTimeline({ events, loading }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const startHour = 6;
  const endHour = 22;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const needlePos = minutesToLeft(currentMinutes, startHour, endHour);

  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  if (loading) {
    return (
      <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-24 h-4 skeleton rounded" />
        </div>
        <div className="h-20 skeleton rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-surface border border-slate-700/50 p-5">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Calendar size={14} className="text-accent" />
        Today&apos;s Calendar
      </h2>

      {/* Timeline */}
      <div className="relative">
        {/* Hour labels */}
        <div className="flex justify-between text-[9px] text-slate-500 mb-1 px-0">
          {hours.filter((_, i) => i % 2 === 0).map((h) => (
            <span key={h} style={{ position: "absolute", left: `${minutesToLeft(h * 60, startHour, endHour)}%`, transform: "translateX(-50%)" }}>
              {h}:00
            </span>
          ))}
        </div>

        {/* Track */}
        <div className="relative mt-5 h-16 bg-slate-800/50 rounded-lg overflow-visible">
          {/* Hour gridlines */}
          {hours.map((h) => (
            <div
              key={h}
              className="absolute top-0 bottom-0 w-px bg-slate-700/30"
              style={{ left: `${minutesToLeft(h * 60, startHour, endHour)}%` }}
            />
          ))}

          {/* Events */}
          {events.map((evt, i) => {
            const startMin = timeToMinutes(evt.start);
            const endMin = timeToMinutes(evt.end);
            const left = minutesToLeft(startMin, startHour, endHour);
            const width = minutesToLeft(endMin, startHour, endHour) - left;
            const isPast = currentMinutes > endMin;
            const isCurrent = currentMinutes >= startMin && currentMinutes <= endMin;

            return (
              <div
                key={i}
                className={`group absolute top-1 bottom-1 rounded-md flex items-center px-1.5 overflow-hidden cursor-pointer transition-all ${
                  isPast ? "opacity-40" : isCurrent ? "ring-1 ring-white/30 shadow-lg" : ""
                }`}
                style={{
                  left: `${left}%`,
                  width: `${Math.max(width, 2)}%`,
                  backgroundColor: evt.color + (isPast ? "66" : "cc"),
                }}
              >
                <span className="text-[9px] font-medium text-white truncate leading-tight">
                  {evt.title}
                </span>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                  <div className="text-xs font-medium text-white">{evt.title}</div>
                  <div className="text-[10px] text-slate-400">{evt.start} – {evt.end}</div>
                </div>
              </div>
            );
          })}

          {/* Current time needle */}
          {currentMinutes >= startHour * 60 && currentMinutes <= endHour * 60 && (
            <div
              className="absolute top-0 bottom-0 z-20"
              style={{ left: `${needlePos}%` }}
            >
              <div className="w-2 h-2 rounded-full bg-red-500 -translate-x-1/2 -translate-y-1" />
              <div className="w-0.5 h-full bg-red-500 -translate-x-1/4" />
            </div>
          )}
        </div>
      </div>

      {/* Event list below (mobile-friendly) */}
      <div className="mt-3 space-y-1 sm:hidden">
        {events.map((evt, i) => {
          const isPast = currentMinutes > timeToMinutes(evt.end);
          return (
            <div key={i} className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs ${isPast ? "opacity-40" : ""}`}>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: evt.color }} />
              <span className="text-slate-300 truncate">{evt.title}</span>
              <span className="text-slate-500 ml-auto flex-shrink-0">{evt.start}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
