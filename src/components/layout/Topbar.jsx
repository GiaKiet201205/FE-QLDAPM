import { Bell } from 'lucide-react'

export default function Topbar({ role, pageTitle, pageSubtitle }) {
  return (
    <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div>
        <h1 className="text-[15px] font-semibold text-slate-900 leading-tight">{pageTitle}</h1>
        {pageSubtitle && <p className="text-xs text-slate-400 leading-tight">{pageSubtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">{role.label}</span>
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
            <div className="text-xs font-semibold text-slate-800">Tài khoản backend</div>
            <div className="text-[11px] text-slate-400">{role.label}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
