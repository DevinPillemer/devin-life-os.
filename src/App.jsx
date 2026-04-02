import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './Layout'
import DashboardPage from './pages/DashboardPage'
import DailyHabitsPage from './pages/DailyHabitsPage'
import HealthDashboardPage from './pages/HealthDashboardPage'
import GoalsTrackerPage from './pages/GoalsTrackerPage'
import FinancialDashboardPage from './pages/FinancialDashboardPage'
import WalletDashboardPage from './pages/WalletDashboardPage'
import LearningHubPage from './pages/LearningHubPage'
import CourseDetailPage from './pages/CourseDetailPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="habits" element={<DailyHabitsPage />} />
        <Route path="health" element={<HealthDashboardPage />} />
        <Route path="goals" element={<GoalsTrackerPage />} />
        <Route path="finance" element={<FinancialDashboardPage />} />
        <Route path="wallet" element={<WalletDashboardPage />} />
        <Route path="learning" element={<LearningHubPage />} />
        <Route path="learning/:id" element={<CourseDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
