import { entityApi } from './storage'

const entities = [
  'Activity', 'Course', 'DailyHabitRecord', 'EarnedCredit', 'Goal', 'HabitifySync', 'HabitPoints', 'Incentive',
  'JointFinanceRecord', 'MonthlySummary', 'Motivation', 'PersonalFinanceRecord', 'Transaction', 'UserProgress',
  'WalletPointsRecord', 'WalletTransaction', 'WeeklyActivitySummary', 'WeeklyGoal', 'WeeklyWalletSummary',
  'BudgetCheckTracker', 'HabitSyncLog', 'StravaWorkoutLog', 'SyncStatusRecord', 'WeeklySwimPerformance'
]

export const api = Object.fromEntries(entities.map((name) => [name, entityApi(name)]))
