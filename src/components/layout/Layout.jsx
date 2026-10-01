import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

function findPageMeta(role, pathname) {
  for (const section of role.sections) {
    for (const item of section.items) {
      const isMatch = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)
      if (isMatch) return item
    }
  }
  return { label: 'Dashboard' }
}

export default function Layout({ role, onChangeRole }) {
  const { pathname } = useLocation()
  const page = findPageMeta(role, pathname)

  return (
    <div className="flex bg-[#F5F6F8] min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          role={role}
          onChangeRole={onChangeRole}
          pageTitle={page.label}
          pageSubtitle={page.label === 'Dashboard' ? 'Academic Cycle: Today, Oct 14, 2024' : undefined}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
