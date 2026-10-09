import { useMemo } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Classes from './pages/Classes'
import AvailabilityRegister from './pages/AvailabilityRegister'
import AccountManagement from './pages/AccountManagement' 
import PlaceholderPage from './pages/PlaceholderPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import PayrollPage from './pages/PayrollPage'
import StatisticsPage from './pages/StatisticsPage'
import { AcademicDataProvider } from './features/academic/AcademicDataContext'
import { ROLES } from './config/roles'
import AccountDataProvider from './features/accounts/AccountDataProvider'
import { useAccountData } from './features/accounts/hooks/useAccountData'
import ProtectedRoute from './features/auth/components/ProtectedRoute'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function resolveElement(item, roleKey) {
  if (item.meta?.page === 'payroll') {
    return (
      <PayrollPage
        permission={item.meta.permission}
        scope={item.meta.scope}
        roleKey={roleKey}
        title={item.label}
      />
    )
  }
  if (item.meta?.page === 'statistics') {
    return <StatisticsPage />
  }
  return <PlaceholderPage title={item.label} />
}

function AppRoutes() {
  const { authUser } = useAccountData();
  const isLoggedIn = !!authUser;
  const roleKey = authUser?.roleKey || 'ADMIN';

  const role = ROLES[roleKey] || ROLES['ADMIN'];

  const allItems = useMemo(() => {
    const items = []
    const seen = new Set()

    role.sections.forEach((section) =>
      section.items.forEach((item) => {
        if (!seen.has(item.path)) {
          seen.add(item.path)
          items.push(item)
        }
      })
    )

    return items
  }, [role])

  return (
    <AcademicDataProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={2000} />
        
        <Routes>
          <Route 
            path="/login" 
            element={isLoggedIn ? <Navigate to={`/${roleKey.toLowerCase()}`} replace /> : <LoginPage />}
          />

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route 
            path="/"
            element={<Navigate to={isLoggedIn ? `/${roleKey.toLowerCase()}` : '/login'} replace />}
          />

          <Route
            path={`/${roleKey.toLowerCase()}`}
            element={
              <ProtectedRoute allowedRoles={[roleKey]}>
                <Layout role={role} />
              </ProtectedRoute>
            }
          >
          <Route path="profile" element={<ProfilePage />} />
          <Route
            path="*"
            element={
              <Navigate
                to={isLoggedIn ? `/${roleKey.toLowerCase()}` : '/login'}
                replace
              />
            }
          />
            {allItems.map((item) =>
              item.path === '/' ? (
                <Route
                  key={item.path}
                  index
                  element={<Dashboard role={role} />}
                />
              ) : item.path === '/students' ? (
                <Route
                  key={item.path}
                  path="students"
                  element={<Students role={role} />}
                />
              ) : item.path.startsWith('/classes') ||
                item.path === '/my-classes' ? (
                <Route
                  key={item.path}
                  path={item.path.slice(1)}
                  element={<Classes role={role} />}
                />
              ) : item.path === '/availability/register' ? (
                <Route
                  key={item.path}
                  path="availability/register"
                  element={<AvailabilityRegister />}
                />
              ) : item.path === '/accounts' ? (
                <Route
                  key={item.path}
                  path="accounts"
                  element={<ProtectedRoute allowedRoles={['ADMIN']}><AccountManagement /></ProtectedRoute>}
                />
              ) : (
                <Route
                  key={item.path}
                  path={item.path.slice(1)}
                  element={resolveElement(item, roleKey)}
                />
              )
            )}
          </Route>
          <Route path="*" element={<Navigate to={isLoggedIn ? `/${roleKey.toLowerCase()}` : '/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </AcademicDataProvider>
  )
}

export default function App() {
  return <AccountDataProvider><AppRoutes /></AccountDataProvider>
}
