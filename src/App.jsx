import { useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PlaceholderPage from './pages/PlaceholderPage'
import LoginPage from './pages/LoginPage'
import { ROLES } from './config/roles'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [roleKey, setRoleKey] = useState('ADMIN')
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
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={2000} />
      
      <Routes>
        <Route 
          path="/login" 
          element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} 
        />
        <Route 
          path="/" 
          element={
            isLoggedIn ? (
              <Layout role={role} onChangeRole={setRoleKey} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          {allItems.map((item) =>
            item.path === '/' ? (
              <Route key={item.path} index element={<Dashboard role={role} />} />
            ) : (
              <Route
                key={item.path}
                path={item.path.slice(1)}
                element={<PlaceholderPage title={item.label} />}
              />
            )
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App