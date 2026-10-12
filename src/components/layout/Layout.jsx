import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

function findPageMeta(role, pathname) {
  const prefix = `/${role.key.toLowerCase()}`
  const pagePath = pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname === prefix ? '/' : pathname
  if (pagePath === '/profile') return { label: 'Thông tin cá nhân' }
  let match = null
  for (const section of role.sections) {
    for (const item of section.items) {
      const isMatch = item.path === '/' ? pagePath === '/' : pagePath === item.path || pagePath.startsWith(`${item.path}/`)
      if (isMatch && (!match || item.path.length > match.path.length)) match = item
    }
  }
  return match || { label: 'Dashboard' }
}

export default function Layout({ role }) {
  const { pathname } = useLocation()
  const page = findPageMeta(role, pathname)

  return (
    <div className="flex bg-[#F5F6F8] min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          role={role}
          pageTitle={page.label}
          pageSubtitle={page.label === 'Dashboard' ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()) : undefined}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
