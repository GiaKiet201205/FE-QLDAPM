// Du lieu mau cho trang Thong ke tong quan (Admin) - sau nay thay bang goi API that

const MONTH_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']

// Sinh du lieu theo cong thuc co dinh (khong dung Math.random) de ket qua on dinh moi lan load
function buildYearData(year, monthsCount = 12) {
  const yearFactor = (year - 2023) * 0.12 // tang truong ~12%/nam

  return MONTH_LABELS.slice(0, monthsCount).map((label, i) => {
    const seasonal = 1 + 0.15 * Math.sin((i / 12) * Math.PI * 2)
    const revenue = Math.round((48000 * (1 + yearFactor) * seasonal) / 100) * 100
    const salaryCost = Math.round((revenue * (0.58 + (i % 3) * 0.01)) / 100) * 100
    const students = Math.round((1100 * (1 + yearFactor) * seasonal) / 10) * 10
    const newEnrollments = Math.round(40 * (1 + yearFactor) * seasonal)
    const classes = Math.round(28 * (1 + yearFactor * 0.6) + (i % 4))

    return {
      month: label,
      revenue,
      salaryCost,
      profit: revenue - salaryCost,
      students,
      newEnrollments,
      classes,
    }
  })
}

const YEARS_DATA = {
  2023: buildYearData(2023, 12),
  2024: buildYearData(2024, 12),
  2025: buildYearData(2025, 10), // nam hien tai, du lieu tinh den thang 10
}

export const AVAILABLE_YEARS = [2025, 2024, 2023]

export function getMonthlyStatistics(year) {
  return YEARS_DATA[year] || YEARS_DATA[2024]
}

// month: 'ALL' hoac chi so 0-11 (ung voi T1-T12)
export function getOverviewStatistics(year, month) {
  const monthly = getMonthlyStatistics(year)
  const rows = month === 'ALL' ? monthly : monthly.filter((_, i) => i === Number(month))
  const base = rows.length ? rows : monthly

  const revenue = base.reduce((s, r) => s + r.revenue, 0)
  const salaryCost = base.reduce((s, r) => s + r.salaryCost, 0)
  const newEnrollments = base.reduce((s, r) => s + r.newEnrollments, 0)

  const latest = monthly[monthly.length - 1]

  return {
    revenue,
    salaryCost,
    profit: revenue - salaryCost,
    newEnrollments,
    students: latest.students,
    classes: latest.classes,
  }
}

export const EMPLOYEE_BREAKDOWN = [
  { role: 'Giáo viên', count: 28, color: '#3B82F6' },
  { role: 'TC', count: 4, color: '#8B5CF6' },
  { role: 'CM', count: 3, color: '#F59E0B' },
  { role: 'Sale', count: 10, color: '#10B981' },
  { role: 'CS', count: 12, color: '#EC4899' },
  { role: 'Admin', count: 2, color: '#EF4444' },
]

export function getTotalEmployees() {
  return EMPLOYEE_BREAKDOWN.reduce((s, r) => s + r.count, 0)
}