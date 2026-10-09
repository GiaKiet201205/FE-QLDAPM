import { useMemo, useState } from 'react'
import { Users, School, Briefcase, DollarSign, Wallet, TrendingUp, ChevronDown } from 'lucide-react'
import {
  AVAILABLE_YEARS,
  getMonthlyStatistics,
  getOverviewStatistics,
  EMPLOYEE_BREAKDOWN,
  getTotalEmployees,
} from '../data/statisticsData'
import RevenueChart from '../components/statistics/RevenueChart'
import EmployeeBreakdown from '../components/statistics/EmployeeBreakdown'
import EnrollmentBarChart from '../components/statistics/EnrollmentBarChart'
import MonthlyStatsTable from '../components/statistics/MonthlyStatsTable'

const MONTH_OPTIONS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']

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

export default function StatisticsPage() {
  const [year, setYear] = useState(AVAILABLE_YEARS[0])
  const [month, setMonth] = useState('ALL')

  const monthly = useMemo(() => getMonthlyStatistics(year), [year])
  const overview = useMemo(() => getOverviewStatistics(year, month), [year, month])
  const totalEmployees = useMemo(() => getTotalEmployees(), [])

  const periodLabel = month === 'ALL' ? `Cả năm ${year}` : `${MONTH_OPTIONS[Number(month)]}/${year}`

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Thống kê tổng quan</h2>
          <p className="text-sm text-slate-400">Số liệu vận hành và tài chính toàn hệ thống</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="appearance-none text-sm bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-slate-700"
            >
              <option value="ALL">Cả năm</option>
              {monthly.map((m, i) => (
                <option key={m.month} value={i}>{m.month}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={year}
              onChange={(e) => { setYear(Number(e.target.value)); setMonth('ALL') }}
              className="appearance-none text-sm bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-slate-700"
            >
              {AVAILABLE_YEARS.map((y) => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Row 1: Van hanh */}
      <div>
        <h3 className="text-xs font-semibold tracking-wide text-slate-400 mb-3">VẬN HÀNH · TÍNH ĐẾN HIỆN TẠI</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={Users}
            label="TỔNG HỌC VIÊN"
            value={overview.students.toLocaleString()}
            sub={`+${overview.newEnrollments} học viên mới trong ${periodLabel.toLowerCase()}`}
            accent="#3B82F6"
          />
          <StatCard
            icon={School}
            label="TỔNG LỚP HỌC"
            value={overview.classes}
            sub="Đang hoạt động"
            accent="#8B5CF6"
          />
          <StatCard
            icon={Briefcase}
            label="TỔNG NHÂN VIÊN"
            value={totalEmployees}
            sub="6 vai trò · GV, TC, CM, Sale, CS, Admin"
            accent="#F59E0B"
          />
        </div>
      </div>

      {/* Row 2: Tai chinh */}
      <div>
        <h3 className="text-xs font-semibold tracking-wide text-slate-400 mb-3">TÀI CHÍNH · {periodLabel.toUpperCase()}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={DollarSign}
            label="DOANH THU"
            value={`$${overview.revenue.toLocaleString()}`}
            sub={periodLabel}
            accent="#10B981"
          />
          <StatCard
            icon={Wallet}
            label="CHI PHÍ LƯƠNG"
            value={`$${overview.salaryCost.toLocaleString()}`}
            sub={`${((overview.salaryCost / overview.revenue) * 100).toFixed(0)}% doanh thu`}
            accent="#EF4444"
          />
          <StatCard
            icon={TrendingUp}
            label="LỢI NHUẬN"
            value={`$${overview.profit.toLocaleString()}`}
            sub={periodLabel}
            accent="#2563EB"
          />
        </div>
      </div>

            {/* Bang chi tiet */}
      <MonthlyStatsTable data={monthly} year={year} />

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <RevenueChart data={monthly} />
        <EmployeeBreakdown data={EMPLOYEE_BREAKDOWN} total={totalEmployees} />
      </div>

      {/* Chart: cot (bar) */}
      <EnrollmentBarChart data={monthly} />

    </div>
  )
}