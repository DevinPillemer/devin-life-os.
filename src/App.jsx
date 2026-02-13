import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './Layout'
import HomePage from '@/pages/HomePage'
import DashboardPage from '@/pages/DashboardPage'
import DailyHabitsPage from '@/pages/DailyHabitsPage'
import HealthPage from '@/pages/HealthPage'
import GoalsTrackerPage from '@/pages/GoalsTrackerPage'
import FinancialDashboardsPage from '@/pages/FinancialDashboardsPage'
import WalletDashboardPage from '@/pages/WalletDashboardPage'
import CoursePage from '@/pages/CoursePage'
import CourseOutlinePage from '@/pages/CourseOutlinePage'
import CreateCoursePage from '@/pages/CreateCoursePage'
import DailyQuizPage from '@/pages/DailyQuizPage'
import CertificatePage from '@/pages/CertificatePage'
import ProgressPage from '@/pages/ProgressPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="dailyhabits" element={<DailyHabitsPage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="goalstracker" element={<GoalsTrackerPage />} />
        <Route path="financialdashboards" element={<FinancialDashboardsPage />} />
        <Route path="walletdashboard" element={<WalletDashboardPage />} />
        <Route path="course/:id" element={<CoursePage />} />
        <Route path="courseoutline/:id" element={<CourseOutlinePage />} />
        <Route path="createcourse" element={<CreateCoursePage />} />
        <Route path="dailyquiz" element={<DailyQuizPage />} />
        <Route path="certificate/:id" element={<CertificatePage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
