import StatCard from '../components/StatCard'
import DataTable from '../components/DataTable'
import { ActivityFeed, StatusPanel } from '../components/ActivityFeed'
import { getDashboardData } from '../data/mockData'

export default function Dashboard({ role }) {
  const data = getDashboardData(role.key)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
      {/* Main column */}
      <div className="space-y-6 min-w-0">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {data.stats.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>

        {/* Table */}
        <DataTable
          title={data.tableTitle}
          columns={data.tableColumns}
          rows={data.tableRows}
          viewAllLabel="Xem toàn bộ lịch"
        />

        {/* Activity feed */}
        <ActivityFeed activities={data.activities} />
      </div>

      {/* Right panel */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-slate-800">Trạng thái hôm nay</h3>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Online
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Cập nhật theo thời gian thực</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-lg font-bold text-slate-900">{role.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Vai trò hiện tại</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-lg font-bold text-slate-900">Hanoi Main</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Cơ sở</div>
            </div>
          </div>
        </div>

        <StatusPanel title={data.panelTitle} items={data.panelItems} role={role} />
      </div>
    </div>
  )
}
