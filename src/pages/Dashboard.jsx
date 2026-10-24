import { useEffect, useState } from 'react'
import StatCard from '../../src/components/dashboard/StatCard'
import DataTable from '../../src/components/dashboard/DataTable'
import { ActivityFeed } from '../../src/components/dashboard/ActivityFeed'
import StatusPanel from '../../src/components/dashboard/StatusPanel'
import { dashboardApi } from '../../src/services/api'

export default function Dashboard({ role }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true

    dashboardApi.overview()
      .then((response) => {
        if (active) {
          setData(response)
          setError('')
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : 'Không thể tải dữ liệu dashboard.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [role.key, retry])

  if (loading) {
    return (
      <div role="status" className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Đang tải dữ liệu dashboard...
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-700">{error}</p>
        <button
          type="button"
          className="mt-3 text-sm font-medium text-blue-600 hover:underline"
          onClick={() => {
            setError('')
            setLoading(true)
            setRetry((value) => value + 1)
          }}
        >
          Thử tải lại
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
      {/* Main column */}
      <div className="space-y-6 min-w-0">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {data.stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Table */}
        <DataTable
          title={data.tableTitle}
          columns={data.tableColumns}
          rows={data.tableRows}
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
