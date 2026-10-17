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
import TeacherAssignment from './pages/TeacherAssignment'
import StaffAssignment from './pages/StaffAssignment'
import MySchedule from './pages/MySchedule'

import { AcademicDataProvider } from './features/academic/AcademicDataContext'
import { ROLES } from './config/roles'
import { login, getSession, saveSession } from './services/api'
import { AvailabilityScreen, AssignmentScreen, MyScheduleScreen } from './features/scheduling/SchedulingApiScreens'

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
  if (item.meta?.page === 'teacher-assignment') {
    return <AssignmentScreen role="TEACHER" />
  }
  if (item.meta?.page === 'staff-assignment') {
    return <AssignmentScreen key={item.meta.staffRole} role={item.meta.staffRole} />
  }
  if (item.meta?.page === 'my-schedule') {
    return <MyScheduleScreen key={item.meta.roleKey} role={item.meta.roleKey} />
  }
  return <PlaceholderPage title={item.label} />
}

function App() {
  const [session, setSession] = useState(getSession)
  const [roleKey, setRoleKey] = useState(() => getSession()?.role || 'TEACHER')
  const [credentials, setCredentials] = useState({ username:'', password:'' })
  const [authError, setAuthError] = useState('')
  const [busy, setBusy] = useState(false)
  async function authenticate(event) {
    event.preventDefault(); setAuthError('');setBusy(true)
    try {
      const data = await login(credentials.username, credentials.password)
      if (!ROLES[data.role] || !data.token) throw new Error('Vai trò hoặc token không hợp lệ.')
      saveSession(data);setSession(data);setRoleKey(data.role);setCredentials({username:'',password:''})
    } catch(error) { setAuthError(error.message) } finally {setBusy(false)}
  }
  function logout(){saveSession(null);setSession(null);setCredentials({username:'',password:''});}


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

  if (!session) return <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4"><form onSubmit={authenticate} className="w-full max-w-sm space-y-4 rounded-xl border bg-white p-7 shadow-sm"><h1 className="text-xl font-semibold">Đăng nhập QLDAPM</h1><p className="text-sm text-slate-500">Dùng tài khoản backend để đăng ký và phân công lịch.</p><label className="block text-sm">Tài khoản<input className="mt-1 w-full rounded border p-2" required autoComplete="username" value={credentials.username} onChange={e=>setCredentials({...credentials,username:e.target.value})}/></label><label className="block text-sm">Mật khẩu<input className="mt-1 w-full rounded border p-2" required type="password" autoComplete="current-password" value={credentials.password} onChange={e=>setCredentials({...credentials,password:e.target.value})}/></label>{authError&&<p role="alert" className="text-sm text-red-600">{authError}</p>}<button disabled={busy} className="w-full rounded bg-[#173557] p-2 text-white">Đăng nhập</button></form></main>

  return (
    <AcademicDataProvider>
      <div className="flex justify-end bg-slate-50 px-5 py-2 text-xs text-slate-600">{session.username} · {roleKey} <button className="ml-4 underline" onClick={logout}>Đăng xuất</button></div>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout
                role={role}
                onChangeRole={() => {}}
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
                  element={<AvailabilityScreen />}
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