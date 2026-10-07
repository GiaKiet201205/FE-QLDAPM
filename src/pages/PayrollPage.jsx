import { useMemo, useState } from 'react'
import { Clock, Hourglass, CheckCircle2, Search, Download } from 'lucide-react'
import { getPayrollData, getMySalary } from '../data/payrollData'
import { getMyAttendance, getTeamAttendance } from '../data/attendanceData'

import ReviewModal from '../components/payroll/ReviewModal'
import MySalaryCard from '../components/payroll/MySalaryCard'
import { MyAttendanceTable, TeamAttendanceTable } from '../components/payroll/AttendanceTable'

const STAT_ICONS = { Clock, Hourglass, CheckCircle2 }

const STATUS_STYLE = {
  confirmed: { label: 'Confirmed', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  pending: { label: 'Pending Confirmation', dot: 'bg-amber-500', text: 'text-amber-700' },
  rejected: { label: 'Rejected', dot: 'bg-red-500', text: 'text-red-700' },
}

/**
 * Trang Cong luong dung chung cho 3 muc quyen:
 * - 'view'    : GV / Sale / CS -> chi xem, khong co hanh dong
 * - 'manage'  : TC / CM        -> xac nhan (confirm) hoac tu choi truoc khi gui Finance
 * - 'approve' : Admin          -> duyet lan cuoi hoac tu choi
 *
 * scope quyet dinh nguon du lieu: 'teacher' | 'sale' | 'cs' | 'all'
 */
export default function PayrollPage({ permission = 'view', scope = 'teacher', roleKey = 'TEACHER', title, subtitle }) {
  const { meta, stats, records: initialRecords } = useMemo(() => getPayrollData(scope), [scope])
  const [records, setRecords] = useState(initialRecords)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [activeRecord, setActiveRecord] = useState(null)

  const canAct = permission === 'manage' || permission === 'approve'

  const mySalary = useMemo(() => getMySalary(roleKey), [roleKey])
  const myAttendance = useMemo(() => getMyAttendance(roleKey), [roleKey])
  const teamAttendance = useMemo(() => getTeamAttendance(scope), [scope])

  const filtered = records.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  function handleConfirm(record) {
    setRecords((prev) => prev.map((r) => (r.id === record.id ? { ...r, status: 'confirmed' } : r)))
    setActiveRecord(null)
  }

  function handleReject(record) {
    setRecords((prev) => prev.map((r) => (r.id === record.id ? { ...r, status: 'rejected' } : r)))
    setActiveRecord(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title || `Công lương ${meta.personLabel}`}</h2>
          <p className="text-sm text-slate-400">{subtitle || 'Xác minh khối lượng công việc làm cơ sở tính lương'}</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3.5 py-2 hover:bg-slate-50">
          <Download size={15} />
          Export Report
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => {
          const Icon = STAT_ICONS[s.icon]
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start justify-between">
              <div>
                <div className="text-[11px] font-semibold tracking-wide text-slate-400 mb-2">{s.label}</div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{s.value}</div>
                <div className="text-xs text-slate-400">{s.sub}</div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                {Icon && <Icon size={16} />}
              </div>
            </div>
          )
        })}
      </div>

      {/* Table card */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold tracking-wide text-slate-400">LƯƠNG</h3>
        <MySalaryCard mySalary={mySalary} />

        {canAct && (
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Salary Records</h3>
          <span className="text-xs text-slate-400">Showing {filtered.length} of {records.length} records</span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex-1 min-w-[200px]">
            <Search size={14} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${meta.personLabel.toLowerCase()} name or ID...`}
              className="bg-transparent text-sm outline-none w-full placeholder:text-slate-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600"
          >
            <option value="ALL">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending Confirmation</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                <th className="px-5 py-2.5 whitespace-nowrap">{meta.personLabel.toUpperCase()}</th>
                <th className="px-5 py-2.5 whitespace-nowrap">{meta.workLabel.toUpperCase()}</th>
                <th className="px-5 py-2.5 whitespace-nowrap">HOURS</th>
                <th className="px-5 py-2.5 whitespace-nowrap">RATE</th>
                <th className="px-5 py-2.5 whitespace-nowrap">TOTAL</th>
                <th className="px-5 py-2.5 whitespace-nowrap">STATUS</th>
                <th className="px-5 py-2.5 whitespace-nowrap">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const st = STATUS_STYLE[r.status]
                return (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                          {r.name.split(' ').slice(-2).map((w) => w[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 whitespace-nowrap">{r.name}</div>
                          <div className="text-xs text-slate-400">{r.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-slate-700">{r.workCount} {meta.unit}</div>
                      <div className="text-xs text-slate-400">{r.workDesc}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-700 whitespace-nowrap">{r.hours.toFixed(1)} hrs</td>
                    <td className="px-5 py-3 text-slate-700 whitespace-nowrap">${r.rate.toFixed(2)}/hr</td>
                    <td className="px-5 py-3 font-semibold text-slate-900 whitespace-nowrap">${r.total.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {canAct && r.status === 'pending' ? (
                        <button
                          onClick={() => setActiveRecord(r)}
                          className="text-xs font-medium text-white bg-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-800"
                        >
                          {permission === 'approve' ? 'Duyệt' : 'Review'}
                        </button>
                      ) : (
                        <button className="text-xs font-medium text-blue-600 hover:underline">View</button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">
                    Không có bản ghi phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        )}
      </div>

      {/* Phan 3: CONG */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold tracking-wide text-slate-400">CÔNG</h3>
        {canAct ? (
          <TeamAttendanceTable records={teamAttendance} personLabel={meta.personLabel} />
        ) : (
          <MyAttendanceTable records={myAttendance} />
        )}
      </div>
      {canAct && (
        <ReviewModal
          record={activeRecord}
          mode={permission}
          onClose={() => setActiveRecord(null)}
          onConfirm={handleConfirm}
          onReject={handleReject}
        />
      )}
    </div>
  )
}