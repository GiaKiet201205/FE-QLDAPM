import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, GraduationCap, RefreshCw, Users } from 'lucide-react'
import {
  MyAttendanceTable,
  TeamAttendanceTable,
  TeamScheduleTable,
} from '../components/payroll/AttendanceTable'
import { getMonthlyWorkload } from '../services/workloadApi'

const SCOPE_LABELS = {
  teacher: 'giáo viên',
  sale: 'nhân viên Sale',
  cs: 'nhân viên CS',
  all: 'nhân viên',
}

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function StatCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <div className="mb-2 text-[11px] font-semibold tracking-wide text-slate-400">{label}</div>
        <div className="mb-1 text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-xs text-slate-400">{detail}</div>
      </div>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
        <Icon size={16} />
      </div>
    </div>
  )
}

export default function PayrollPage({ scope = 'teacher', roleKey = 'TEACHER', title, subtitle }) {
  const [period, setPeriod] = useState(currentMonth)
  const [data, setData] = useState({ employees: [], schedules: [] })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const managerView = ['TC', 'CM', 'ADMIN'].includes(roleKey)
  const [year, month] = period.split('-').map(Number)

  const requestWorkload = useCallback(
    () => getMonthlyWorkload({ year, month, roleKey, scope }),
    [year, month, roleKey, scope],
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await requestWorkload())
    } catch (requestError) {
      setData({ employees: [], schedules: [] })
      setError(requestError.message || 'Không thể tải dữ liệu công.')
    } finally {
      setLoading(false)
    }
  }, [requestWorkload])

  useEffect(() => {
    let active = true
    requestWorkload()
      .then((result) => {
        if (active) {
          setData(result)
          setError('')
        }
      })
      .catch((requestError) => {
        if (active) {
          setData({ employees: [], schedules: [] })
          setError(requestError.message || 'Không thể tải dữ liệu công.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [requestWorkload])

  const employeeFilter = search.trim().toLocaleLowerCase('vi')
  const employees = useMemo(
    () => data.employees.filter((employee) => (
      `${employee.name} ${employee.code}`.toLocaleLowerCase('vi').includes(employeeFilter)
    )),
    [data.employees, employeeFilter],
  )
  const schedules = useMemo(
    () => data.schedules.filter((schedule) => (
      `${schedule.name} ${schedule.code}`.toLocaleLowerCase('vi').includes(employeeFilter)
    )),
    [data.schedules, employeeFilter],
  )

  const totalDays = data.employees.reduce((sum, employee) => sum + employee.daysWorked, 0)
  const totalHours = data.employees.reduce((sum, employee) => sum + employee.totalHours, 0)
  const teachingSessions = data.employees.reduce((sum, employee) => sum + employee.teachingSessions, 0)
  const monthLabel = period
    ? new Date(year, month - 1, 1).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    : ''
  const viewerRole = managerView ? scope : roleKey.toLowerCase()
  const workloadName = SCOPE_LABELS[scope] || 'nhân viên'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title || `Quản lý công ${workloadName}`}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {subtitle || 'Tổng hợp ngày công, giờ làm và buổi dạy từ lịch đã được phân công.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            <CalendarDays size={15} className="text-slate-400" />
            <span className="sr-only">Chọn tháng</span>
            <input
              type="month"
              value={period}
              onChange={(event) => {
                if (event.target.value) {
                  setError('')
                  setLoading(true)
                  setPeriod(event.target.value)
                }
              }}
              className="bg-transparent outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setError('')
              setLoading(true)
              refresh()
            }}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        Số liệu tháng {monthLabel} được tính từ lịch đã phân công. Đây là giờ công theo kế hoạch, chưa phải giờ
        chấm vào/ra thực tế; hệ thống hiện chưa có API lưu dữ liệu chấm công thực tế.
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Không thể tải dữ liệu công: {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="NHÂN VIÊN CÓ LỊCH"
          value={data.employees.filter((employee) => employee.assignedSessions > 0).length}
          detail={`${data.employees.length} nhân viên trong phạm vi`}
          icon={Users}
        />
        <StatCard
          label="TỔNG NGÀY CÔNG"
          value={totalDays}
          detail="Tổng ngày làm việc theo lịch"
          icon={CalendarDays}
        />
        <StatCard
          label="TỔNG GIỜ THEO LỊCH"
          value={`${totalHours.toFixed(1)} giờ`}
          detail="Tính từ giờ bắt đầu và kết thúc"
          icon={Clock3}
        />
        <StatCard
          label="BUỔI DẠY"
          value={teachingSessions}
          detail="Số lịch dạy được phân công"
          icon={GraduationCap}
        />
      </div>

      {managerView ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Công theo từng nhân viên</h3>
              <p className="mt-1 text-xs text-slate-500">Kỳ tổng hợp: {monthLabel}</p>
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên hoặc mã nhân viên"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 sm:w-72"
            />
          </div>
          {loading
            ? <p className="py-8 text-center text-sm text-slate-500">Đang tải dữ liệu công...</p>
            : <TeamAttendanceTable records={employees} personLabel={workloadName} />}
          {!loading && <TeamScheduleTable records={schedules} />}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Chi tiết lịch làm việc</h3>
            <p className="mt-1 text-xs text-slate-500">Kỳ tổng hợp: {monthLabel}</p>
          </div>
          {loading
            ? <p className="py-8 text-center text-sm text-slate-500">Đang tải dữ liệu công...</p>
            : <MyAttendanceTable records={data.schedules} roleKey={viewerRole.toUpperCase()} />}
        </div>
      )}
    </div>
  )
}
