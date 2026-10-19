import { useEffect, useState } from 'react'
import {
  Briefcase,
  CalendarCheck,
  ChevronDown,
  DollarSign,
  School,
  Users,
  Wallet,
} from 'lucide-react'
import { statisticsApi } from '../services/api'
import RevenueChart from '../components/statistics/RevenueChart'
import EmployeeBreakdown from '../components/statistics/EmployeeBreakdown'
import EnrollmentBarChart from '../components/statistics/EnrollmentBarChart'
import MonthlyStatsTable from '../components/statistics/MonthlyStatsTable'

const today = new Date()
const TODAY = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0'),
].join('-')
const ROLE_COLORS = {
  teachers: '#3B82F6',
  coordinators: '#8B5CF6',
  centerManagers: '#F59E0B',
  sales: '#10B981',
  customerSupport: '#EC4899',
  admins: '#EF4444',
}

function formatCurrency(value) {
  return value == null ? 'Chưa có dữ liệu' : `$${Number(value).toLocaleString()}`
}

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start justify-between">
      <div>
        <div className="text-[11px] font-semibold tracking-wide text-slate-400 mb-2">{label}</div>
        <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
        {sub && <div className="text-xs text-slate-400">{sub}</div>}
      </div>
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}15`, color: accent }}
      >
        <Icon size={16} />
      </div>
    </div>
  )
}

function ScheduleCard({ title, assigned, pending, cancelled, conflicts }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h4 className="text-sm font-semibold text-slate-800 mb-3">{title}</h4>
      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-slate-500">Đã phân công</dt>
        <dd className="text-right font-semibold text-emerald-700">{assigned}</dd>
        <dt className="text-slate-500">Chờ xử lý</dt>
        <dd className="text-right font-semibold text-amber-600">{pending}</dd>
        <dt className="text-slate-500">Đã hủy</dt>
        <dd className="text-right font-semibold text-slate-600">{cancelled}</dd>
        <dt className="text-slate-500">Xung đột</dt>
        <dd className={`text-right font-semibold ${conflicts ? 'text-red-600' : 'text-slate-600'}`}>
          {conflicts}
        </dd>
      </dl>
    </div>
  )
}

export default function StatisticsPage() {
  const [period, setPeriod] = useState('YEAR')
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [date, setDate] = useState(TODAY)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true

    statisticsApi.summary({ period, year, month, date })
      .then((response) => {
        if (active) setData(response)
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : 'Không thể tải dữ liệu thống kê.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [period, year, month, date, retry])

  if (loading && !data) {
    return (
      <div role="status" className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Đang tải dữ liệu thống kê...
      </div>
    )
  }

  if (error && !data) {
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

  const { overview, employees, schedules, financial, monthly } = data
  const periodLabel = period === 'DAY'
    ? new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN')
    : period === 'MONTH'
      ? `Tháng ${month}/${year}`
      : `Năm ${year}`
  const employeeData = [
    { role: 'Giáo viên', count: employees.teachers, color: ROLE_COLORS.teachers },
    { role: 'TC', count: employees.coordinators, color: ROLE_COLORS.coordinators },
    { role: 'CM', count: employees.centerManagers, color: ROLE_COLORS.centerManagers },
    { role: 'Sale', count: employees.sales, color: ROLE_COLORS.sales },
    { role: 'CS', count: employees.customerSupport, color: ROLE_COLORS.customerSupport },
    { role: 'Admin', count: employees.admins, color: ROLE_COLORS.admins },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Thống kê tổng quan</h2>
          <p className="text-sm text-slate-400">Số liệu vận hành và tài chính toàn hệ thống</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select
              aria-label="Khoảng thời gian thống kê"
              value={period}
              onChange={(event) => {
                setLoading(true)
                setError('')
                setPeriod(event.target.value)
              }}
              className="appearance-none text-sm bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-slate-700"
            >
              <option value="YEAR">Theo năm</option>
              <option value="MONTH">Theo tháng</option>
              <option value="DAY">Theo ngày</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {period !== 'DAY' && (
            <input
              aria-label="Năm thống kê"
              type="number"
              min="1"
              max="9999"
              value={year}
              onChange={(event) => {
                setLoading(true)
                setError('')
                setYear(Number(event.target.value))
              }}
              className="w-24 text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
            />
          )}

          {period === 'MONTH' && (
            <div className="relative">
              <select
                aria-label="Tháng thống kê"
                value={month}
                onChange={(event) => {
                  setLoading(true)
                  setError('')
                  setMonth(Number(event.target.value))
                }}
                className="appearance-none text-sm bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-slate-700"
              >
                {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={value}>Tháng {value}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          )}

          {period === 'DAY' && (
            <input
              aria-label="Ngày thống kê"
              type="date"
              value={date}
              onChange={(event) => {
                setLoading(true)
                setError('')
                setDate(event.target.value)
              }}
              className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
            />
          )}
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            className="shrink-0 font-medium hover:underline"
            onClick={() => {
              setError('')
              setLoading(true)
              setRetry((value) => value + 1)
            }}
          >
            Thử tải lại
          </button>
        </div>
      )}
      {loading && (
        <div role="status" className="text-sm text-slate-500">Đang cập nhật thống kê...</div>
      )}

      <section>
        <h3 className="text-xs font-semibold tracking-wide text-slate-400 mb-3">
          VẬN HÀNH · {periodLabel.toUpperCase()}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={Users}
            label="HỌC VIÊN ĐANG HOẠT ĐỘNG"
            value={overview.activeStudents.toLocaleString()}
            sub={`+${overview.newStudents} học viên mới trong kỳ`}
            accent="#3B82F6"
          />
          <StatCard
            icon={School}
            label="LỚP ĐANG HOẠT ĐỘNG"
            value={overview.activeClasses.toLocaleString()}
            sub="Đang trong thời gian đào tạo"
            accent="#8B5CF6"
          />
          <StatCard
            icon={Briefcase}
            label="NHÂN VIÊN ĐANG HOẠT ĐỘNG"
            value={employees.total.toLocaleString()}
            sub="Giáo viên, TC, CM, Sale, CS, Admin"
            accent="#F59E0B"
          />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold tracking-wide text-slate-400 mb-3">
          TÀI CHÍNH · {periodLabel.toUpperCase()}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={DollarSign}
            label="DOANH THU"
            value={formatCurrency(financial.revenue)}
            sub={financial.revenueAvailable ? periodLabel : 'Chưa có dữ liệu giao dịch/học phí'}
            accent="#10B981"
          />
          <StatCard
            icon={Wallet}
            label="CHI PHÍ LƯƠNG"
            value={formatCurrency(financial.salaryCost)}
            sub={financial.payrollRecords == null
              ? 'Dữ liệu công lương hiện chỉ tổng hợp theo tháng'
              : `${financial.payrollRecords} bảng lương trong kỳ`}
            accent="#EF4444"
          />
          <StatCard
            icon={CalendarCheck}
            label="LỊCH CHỜ DUYỆT"
            value={schedules.pendingAvailability.toLocaleString()}
            sub="Yêu cầu lịch rảnh"
            accent="#2563EB"
          />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold tracking-wide text-slate-400 mb-3">
          LỊCH LÀM VIỆC, LỊCH DẠY & TÌNH TRẠNG PHÂN CÔNG
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScheduleCard
            title="Lịch dạy"
            assigned={schedules.teachingAssigned}
            pending={schedules.teachingPending}
            cancelled={schedules.teachingCancelled}
            conflicts={schedules.teachingConflicts}
          />
          <ScheduleCard
            title="Lịch làm việc"
            assigned={schedules.staffAssigned}
            pending={schedules.staffPending}
            cancelled={schedules.staffCancelled}
            conflicts={schedules.staffConflicts}
          />
        </div>
      </section>

      <EmployeeBreakdown data={employeeData} total={employees.total} />

      <MonthlyStatsTable data={monthly} year={data.startDate.slice(0, 4)} />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <RevenueChart data={monthly} />
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Lưu ý về doanh thu</h3>
          <p className="text-xs leading-5 text-slate-500">
            Hệ thống chưa có bảng giao dịch hoặc học phí. Doanh thu chưa được tính và được biểu diễn là
            chưa có dữ liệu, không phải 0 đồng.
          </p>
        </div>
      </div>

      <EnrollmentBarChart data={monthly} />
    </div>
  )
}
