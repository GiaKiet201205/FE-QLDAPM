import { useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'

import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Classes from './pages/Classes'
import AvailabilityRegister from './pages/AvailabilityRegister'
import PlaceholderPage from './pages/PlaceholderPage'
import PayrollPage from '../src/pages/PayrollPage'
import StatisticsPage from '../src/pages/StatisticsPage'

import { AcademicDataProvider } from './features/academic/AcademicDataContext'
import { ROLES } from './config/roles'

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

function App() {
  // Demo role - sau này thay bằng role từ tài khoản đăng nhập
  const [roleKey, setRoleKey] = useState('TEACHER')

  const role = ROLES[roleKey]

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
        <Routes>
          <Route
            path="/"
            element={
              <Layout
                role={role}
                onChangeRole={setRoleKey}
              />
            }
          >
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
              ) : (
<Route
  key={item.path}
  path={item.path.slice(1)}
  element={resolveElement(item, roleKey)}
/>
              )
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AcademicDataProvider>
  )
}

export default App