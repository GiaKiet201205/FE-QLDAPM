import { Bell, ChevronDown } from 'lucide-react'
import { ROLE_LIST } from '../config/roles'

export default function Topbar({ role, onChangeRole, pageTitle, pageSubtitle }) {
  return (
    <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div>
        <h1 className="text-[15px] font-semibold text-slate-900 leading-tight">{pageTitle}</h1>
        {pageSubtitle && <p className="text-xs text-slate-400 leading-tight">{pageSubtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Role switcher - demo dang nhap nhu cac role khac nhau (chua noi BE that) */}
        <div className="relative">
          <select
            value={role.key}
            onChange={(e) => onChangeRole(e.target.value)}
            className="appearance-none text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-slate-700 cursor-pointer hover:bg-slate-100"
          >
            {ROLE_LIST.map((r) => (
              <option key={r.key} value={r.key}>
                Xem như: {r.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <button className="text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-600">
          GMT+7 · EN
        </button>

        <button className="relative w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: role.color }}
          >
            {role.shortLabel}
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold text-slate-800">Elena Nguyen</div>
            <div className="text-[11px] text-slate-400">{role.label}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
