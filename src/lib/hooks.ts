import useSWR from "swr";
import {
  walletData,
  habitsData,
  stravaData,
  notionGoals,
  calendarEvents,
  learningData,
  sleepData,
} from "./mock-data";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Fetch failed");
    return r.json();
  });

export function useFinance() {
  const { data, error, isLoading } = useSWR("/api/finance", fetcher, {
    refreshInterval: 300_000,
  });
  return { finance: data, financeError: error, financeLoading: isLoading };
}

export function useWallet() {
  const { data, error, isLoading } = useSWR("/api/wallet", fetcher, {
    refreshInterval: 300_000,
    fallbackData: walletData,
  });
  return { wallet: data, walletError: error, walletLoading: isLoading };
}

export function useHabits() {
  const { data, error, isLoading } = useSWR("/api/habits", fetcher, {
    refreshInterval: 60_000,
    fallbackData: habitsData,
  });
  return { habits: data, habitsError: error, habitsLoading: isLoading };
}

export function useHealth() {
  const { data, error, isLoading } = useSWR("/api/health", fetcher, {
    refreshInterval: 120_000,
    fallbackData: stravaData,
  });
  return { health: data, healthError: error, healthLoading: isLoading };
}

export function useGoals() {
  const { data, error, isLoading } = useSWR("/api/goals", fetcher, {
    refreshInterval: 60_000,
    fallbackData: notionGoals,
  });
  return { goals: data, goalsError: error, goalsLoading: isLoading };
}

export function useLearning() {
  const { data, error, isLoading } = useSWR("/api/learning", fetcher, {
    refreshInterval: 60_000,
    fallbackData: learningData,
  });
  return { learning: data, learningError: error, learningLoading: isLoading };
}

export function useCalendar() {
  const { data, error, isLoading } = useSWR("/api/calendar", fetcher, {
    refreshInterval: 60_000,
    fallbackData: { events: calendarEvents },
  });
  return { calendar: data, calendarError: error, calendarLoading: isLoading };
}

export function useSleep() {
  const { data, error, isLoading } = useSWR("/api/sleep", fetcher, {
    refreshInterval: 300_000,
    fallbackData: sleepData,
  });
  return { sleep: data, sleepError: error, sleepLoading: isLoading };
}
