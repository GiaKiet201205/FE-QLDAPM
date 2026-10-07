import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

function findPageMeta(role, pathname) {
  const items = role.sections.flatMap((section) => section.items)

  const exact = items.find((item) => item.path === pathname)
  if (exact) return exact

  const nested = items
    .filter(
      (item) =>
        item.path !== '/' &&
        pathname.startsWith(`${item.path}/`)
    )
    .sort((a, b) => b.path.length - a.path.length)[0]

  return nested ?? { label: 'Dashboard' }
}

export default function Layout({ role, onChangeRole }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const page = findPageMeta(role, pathname)

  function handleRoleChange(nextRoleKey) {
    onChangeRole(nextRoleKey)
    navigate('/', { replace: true })
  }

  return (
    <div className="flex bg-[#F5F6F8] min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          role={role}
          onChangeRole={handleRoleChange}
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
