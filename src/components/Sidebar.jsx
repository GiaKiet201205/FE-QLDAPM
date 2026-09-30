import * as Icons from 'lucide-react'
import { NavLink } from 'react-router-dom'

function Icon({ name, ...props }) {
  const Cmp = Icons[name] || Icons.Circle
  return <Cmp {...props} />
}

export default function Sidebar({ role }) {
  return (
    <aside className="w-64 shrink-0 bg-[#0B1220] text-slate-300 flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          IIG
        </div>
        <div>
          <div className="text-white text-sm font-semibold leading-tight">IIG Learning</div>
          <div className="text-[11px] text-slate-500 leading-tight">ERP System</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {role.sections.map((section) => (
          <div key={section.title}>
            <div className="px-2 mb-2 text-[11px] font-semibold tracking-wide text-slate-500">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon name={item.icon} size={16} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500">
        <span>v2.4.1</span>
        <Icon name="Settings" size={14} />
      </div>
    </aside>
  )
}
