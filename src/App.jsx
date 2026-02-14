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
import LearningHomePage from '@/pages/learning/LearningHomePage'
import LearningCourseOverviewPage from '@/pages/learning/LearningCourseOverviewPage'
import LearningSessionPage from '@/pages/learning/LearningSessionPage'
import LearningQuizPage from '@/pages/learning/LearningQuizPage'
import LearningExercisePage from '@/pages/learning/LearningExercisePage'
import LearningResultsPage from '@/pages/learning/LearningResultsPage'

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
        <Route path="learning" element={<LearningHomePage />} />
        <Route path="learning/course/:courseId" element={<LearningCourseOverviewPage />} />
        <Route path="learning/course/:courseId/session" element={<LearningSessionPage />} />
        <Route path="learning/course/:courseId/quiz" element={<LearningQuizPage />} />
        <Route path="learning/course/:courseId/exercise" element={<LearningExercisePage />} />
        <Route path="learning/course/:courseId/results" element={<LearningResultsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
