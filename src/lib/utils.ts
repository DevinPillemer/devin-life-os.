import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function formatCurrency(amount: number, currency = "₪"): string {
  return `${currency}${amount.toLocaleString("en-IL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
