import { entityApi } from './storage';

const entities = [
  'Activity', 'Course', 'DailyHabitRecord', 'EarnedCredit', 'Goal',
  'HabitifySync', 'HabitPoints', 'Incentive', 'JointFinanceRecord',
  'MonthlySummary', 'Motivation', 'PersonalFinanceRecord', 'Transaction',
  'UserProgress', 'WalletPointsRecord', 'WalletTransaction',
  'WeeklyActivitySummary', 'WeeklyGoal', 'WeeklyWalletSummary',
  'BudgetCheckTracker', 'HabitSyncLog', 'StravaWorkoutLog',
  'SyncStatusRecord', 'WeeklySwimPerformance'
];

const createEntityClient = (name) => {
  const api = entityApi(name);
  return {
    list: async (sort, limit) => {
      let items = api.list();
      if (sort && sort.startsWith('-')) {
        const field = sort.slice(1);
        items.sort((a, b) => (b[field] || '').localeCompare?.(a[field] || '') || 0);
      }
      if (limit) items = items.slice(0, limit);
      return items;
    },
    filter: async (criteria) => {
      const items = api.list();
      return items.filter(item =>
        Object.entries(criteria).every(([key, val]) => item[key] === val)
      );
    },
    get: async (id) => api.get(id),
    create: async (data) => api.create(data),
    update: async (id, data) => api.update(id, data),
    delete: async (id) => api.delete(id),
  };
};

export const base44 = {
  entities: Object.fromEntries(
    entities.map(name => [name, createEntityClient(name)])
  )
};
