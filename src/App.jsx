import { useEffect, useMemo, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import Layout from './components/layout/Layout'

import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Classes from './pages/Classes'
import PlaceholderPage from './pages/PlaceholderPage'
import PayrollPage from './pages/PayrollPage'
import StatisticsPage from './pages/StatisticsPage'

import {
  AcademicDataProvider,
} from './features/academic/AcademicDataContext'

import {
  AvailabilityScreen,
  AssignmentScreen,
  MyScheduleScreen,
} from './features/scheduling/SchedulingApiScreens'

import { ROLES } from './config/roles'

import {
  getSession,
  login,
  saveSession,
} from './services/api'


/* =========================================================
   RESOLVE PAGE THEO META TRONG roles.js
========================================================= */

function resolveElement(item, roleKey) {
  /* =========================
     PAYROLL
  ========================= */

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

  /* =========================
     STATISTICS
  ========================= */

  if (item.meta?.page === 'statistics') {
    return <StatisticsPage />
  }

  /* =========================
     TC - PHÂN CÔNG TEACHER
  ========================= */

  if (item.meta?.page === 'teacher-assignment') {
    return (
      <AssignmentScreen
        role="TEACHER"
      />
    )
  }

  /* =========================
     CM - PHÂN CÔNG SALE / CS
  ========================= */

  if (item.meta?.page === 'staff-assignment') {
    return (
      <AssignmentScreen
        key={item.meta.staffRole}
        role={item.meta.staffRole}
      />
    )
  }

  /* =========================
     TEACHER / SALE / CS
     XEM LỊCH CÁ NHÂN
  ========================= */

  if (item.meta?.page === 'my-schedule') {
    return (
      <MyScheduleScreen
        key={item.meta.roleKey}
        role={item.meta.roleKey}
      />
    )
  }

  /* =========================
     PLACEHOLDER
  ========================= */

  return (
    <PlaceholderPage
      title={item.label}
    />
  )
}


/* =========================================================
   LOGIN SCREEN
========================================================= */

function LoginScreen({
  credentials,
  setCredentials,
  authError,
  busy,
  onSubmit,
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-7 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Đăng nhập QLDAPM
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Dùng tài khoản backend để truy cập hệ thống.
          </p>
        </div>

        {/* USERNAME */}

        <label className="block text-sm text-slate-700">
          Tài khoản

          <input
            className="
              mt-1
              w-full
              rounded-md
              border
              border-slate-300
              px-3
              py-2
              outline-none
              transition
              focus:border-blue-600
              focus:ring-2
              focus:ring-blue-100
            "
            required
            autoComplete="username"
            value={credentials.username}
            onChange={(event) =>
              setCredentials((current) => ({
                ...current,
                username: event.target.value,
              }))
            }
          />
        </label>

        {/* PASSWORD */}

        <label className="block text-sm text-slate-700">
          Mật khẩu

          <input
            className="
              mt-1
              w-full
              rounded-md
              border
              border-slate-300
              px-3
              py-2
              outline-none
              transition
              focus:border-blue-600
              focus:ring-2
              focus:ring-blue-100
            "
            required
            type="password"
            autoComplete="current-password"
            value={credentials.password}
            onChange={(event) =>
              setCredentials((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
          />
        </label>

        {/* ERROR */}

        {authError && (
          <p
            role="alert"
            className="text-sm text-red-600"
          >
            {authError}
          </p>
        )}

        {/* LOGIN BUTTON */}

        <button
          type="submit"
          disabled={busy}
          className="
            w-full
            rounded-md
            bg-[#173557]
            px-4
            py-2
            font-medium
            text-white
            transition
            hover:bg-[#24486f]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {busy
            ? 'Đang đăng nhập...'
            : 'Đăng nhập'}
        </button>
      </form>
    </main>
  )
}


/* =========================================================
   APP
========================================================= */

export default function App() {
  /* =========================
     SESSION
  ========================= */

  const [session, setSession] = useState(
    () => getSession(),
  )

  /* =========================
     LOGIN FORM
  ========================= */

  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  })

  const [authError, setAuthError] = useState('')

  const [busy, setBusy] = useState(false)


  /* =======================================================
     SESSION EXPIRED EVENT
  ======================================================= */

  useEffect(() => {
    function handleSessionExpired() {
      setSession(null)

      setAuthError(
        'Phiên đăng nhập đã hết hạn.',
      )
    }

    window.addEventListener(
      'qldapm:session-expired',
      handleSessionExpired,
    )

    return () => {
      window.removeEventListener(
        'qldapm:session-expired',
        handleSessionExpired,
      )
    }
  }, [])


  /* =======================================================
     LOGIN
  ======================================================= */

  async function authenticate(event) {
    event.preventDefault()

    setAuthError('')
    setBusy(true)

    try {
      const data = await login(
        credentials.username,
        credentials.password,
      )

      /* =========================
         VALIDATE RESPONSE
      ========================= */

      if (!data?.token) {
        throw new Error(
          'Backend không trả về token hợp lệ.',
        )
      }

      if (!data?.role) {
        throw new Error(
          'Backend không trả về role.',
        )
      }

      if (!ROLES[data.role]) {
        throw new Error(
          `Role "${data.role}" chưa được cấu hình trong frontend.`,
        )
      }

      /* =========================
         SAVE SESSION
      ========================= */

      saveSession(data)

      setSession(data)

      /* =========================
         RESET FORM
      ========================= */

      setCredentials({
        username: '',
        password: '',
      })
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Đăng nhập thất bại.',
      )
    } finally {
      setBusy(false)
    }
  }


  /* =======================================================
     LOGOUT
  ======================================================= */

  function logout() {
    saveSession(null)

    setSession(null)

    setCredentials({
      username: '',
      password: '',
    })

    setAuthError('')
  }


  /* =======================================================
     ROLE
  ======================================================= */

  const roleKey =
    session?.role || 'TEACHER'

  const role =
    ROLES[roleKey] || ROLES.TEACHER


  /* =======================================================
     GET MENU ITEMS CỦA ROLE
  ======================================================= */

  const allItems = useMemo(() => {
    const items = []

    const seen = new Set()

    role.sections.forEach((section) => {
      section.items.forEach((item) => {
        if (!seen.has(item.path)) {
          seen.add(item.path)

          items.push(item)
        }
      })
    })

    return items
  }, [role])


  /* =======================================================
     CHƯA LOGIN
  ======================================================= */

  if (
    !session ||
    !ROLES[session.role]
  ) {
    return (
      <LoginScreen
        credentials={credentials}
        setCredentials={setCredentials}
        authError={authError}
        busy={busy}
        onSubmit={authenticate}
      />
    )
  }


  /* =======================================================
     APP SAU LOGIN
  ======================================================= */

  return (
    <AcademicDataProvider>
      <BrowserRouter>
        {/* =================================================
            USER SESSION BAR
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-end
            bg-slate-50
            px-5
            py-2
            text-xs
            text-slate-600
          "
        >
          <span>
            {session.username || 'User'}
            {' · '}
            {roleKey}
          </span>

          <button
            type="button"
            className="
              ml-4
              font-medium
              underline
              hover:text-slate-900
            "
            onClick={logout}
          >
            Đăng xuất
          </button>
        </div>


        {/* =================================================
            ROUTER
        ================================================= */}

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
            {/* =============================================
                ROUTES TỪ roles.js
            ============================================= */}

            {allItems.map((item) => {
              /* =========================
                 DASHBOARD
              ========================= */

              if (item.path === '/') {
                return (
                  <Route
                    key={item.path}
                    index
                    element={
                      <Dashboard
                        role={role}
                      />
                    }
                  />
                )
              }


              /* =========================
                 STUDENTS
              ========================= */

              if (
                item.path === '/students'
              ) {
                return (
                  <Route
                    key={item.path}
                    path="students"
                    element={
                      <Students
                        role={role}
                      />
                    }
                  />
                )
              }


              /* =========================
                 CLASSES
              ========================= */

              if (
                item.path.startsWith('/classes') ||
                item.path === '/my-classes'
              ) {
                return (
                  <Route
                    key={item.path}
                    path={item.path.slice(1)}
                    element={
                      <Classes
                        role={role}
                      />
                    }
                  />
                )
              }


              /* =========================
                 AVAILABILITY

                 Teacher
                 Sale
                 CS
              ========================= */

              if (
                item.path ===
                '/availability/register'
              ) {
                return (
                  <Route
                    key={item.path}
                    path="availability/register"
                    element={
                      <AvailabilityScreen />
                    }
                  />
                )
              }


              /* =========================
                 DYNAMIC PAGE

                 teacher-assignment
                 staff-assignment
                 my-schedule
                 payroll
                 statistics
                 placeholder
              ========================= */

              return (
                <Route
                  key={item.path}
                  path={item.path.slice(1)}
                  element={
                    resolveElement(
                      item,
                      roleKey,
                    )
                  }
                />
              )
            })}


            {/* =============================================
                NOT FOUND
            ============================================= */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AcademicDataProvider>
  )
}