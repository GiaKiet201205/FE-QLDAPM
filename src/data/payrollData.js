// Du lieu mau cho man hinh Cong luong - sau nay thay bang goi API that qua services/payrollService.js

const SCOPE_META = {
  teacher: { personLabel: 'Giáo viên', workLabel: 'Lớp phụ trách', unit: 'Classes' },
  sale: { personLabel: 'Nhân viên Sale', workLabel: 'Ca làm việc', unit: 'Shifts' },
  cs: { personLabel: 'Nhân viên CS', workLabel: 'Ca hỗ trợ', unit: 'Shifts' },
}

const RAW_RECORDS = {
  teacher: [
    { name: 'David Miller', code: 'FAC-1092', workCount: 4, workDesc: 'IELTS Lead • M75-04, F65-01', hours: 72.0, rate: 30.0, status: 'confirmed' },
    { name: 'Nguyen Van An', code: 'FAC-1180', workCount: 2, workDesc: 'TOEIC • Intensive 850', hours: 28.5, rate: 30.0, status: 'pending' },
    { name: 'Sarah Jenkins', code: 'FAC-1144', workCount: 3, workDesc: 'General English • IELTS F65-02', hours: 54.0, rate: 32.0, status: 'confirmed' },
    { name: 'Emily Watson', code: 'FAC-1205', workCount: 2, workDesc: 'SAT Instructor • Math Adv.', hours: 36.0, rate: 28.0, status: 'pending' },
    { name: 'Tran Quoc Bao', code: 'FAC-1162', workCount: 3, workDesc: 'IELTS • Writing Intensive', hours: 48.0, rate: 30.0, status: 'confirmed' },
    { name: 'Michael Scott', code: 'FAC-1055', workCount: 1, workDesc: 'Business English • BEC-01', hours: 24.0, rate: 35.0, status: 'confirmed' },
  ],
  sale: [
    { name: 'Tran Minh Anh', code: 'SAL-2031', workCount: 5, workDesc: 'Front Desk 1 • Ca sáng', hours: 40.0, rate: 25.0, status: 'confirmed' },
    { name: 'Pham Thi Hoa', code: 'SAL-2048', workCount: 4, workDesc: 'Front Desk 2 • Ca chiều', hours: 32.0, rate: 25.0, status: 'pending' },
    { name: 'Le Van Tu', code: 'SAL-2052', workCount: 5, workDesc: 'Front Desk 1 • Ca sáng', hours: 40.0, rate: 25.0, status: 'confirmed' },
  ],
  cs: [
    { name: 'Le Quoc Huy', code: 'CS-3011', workCount: 5, workDesc: 'Desk 2 • Hỗ trợ lớp', hours: 40.0, rate: 24.0, status: 'confirmed' },
    { name: 'Nguyen Thi Mai', code: 'CS-3022', workCount: 3, workDesc: 'Hỗ trợ lớp IELTS', hours: 24.0, rate: 24.0, status: 'pending' },
  ],
}

function buildRecords(scope) {
  const rows = RAW_RECORDS[scope] || []
  return rows.map((r, i) => ({
    id: `${scope}-${i}`,
    ...r,
    total: Math.round(r.hours * r.rate * 100) / 100,
  }))
}
const FIXED_SALARY_BY_ROLE = {
  TC: { amount: 15000000, period: 'Tháng 10/2024' },
  CM: { amount: 16000000, period: 'Tháng 10/2024' },
  ADMIN: { amount: 20000000, period: 'Tháng 10/2024' },
}

const MY_HOURLY_BY_ROLE = {
  TEACHER: { name: 'David Miller', code: 'FAC-1092', hours: 72.0, rate: 30.0 },
  SALE: { name: 'Tran Minh Anh', code: 'SAL-2031', hours: 40.0, rate: 25.0 },
  CS: { name: 'Le Quoc Huy', code: 'CS-3011', hours: 40.0, rate: 24.0 },
}

export function getMySalary(roleKey) {
  const fixed = FIXED_SALARY_BY_ROLE[roleKey]
  if (fixed) {
    return { payType: 'fixed', amount: fixed.amount, period: fixed.period }
  }

  const h = MY_HOURLY_BY_ROLE[roleKey] || MY_HOURLY_BY_ROLE.TEACHER
  return {
    payType: 'hourly',
    name: h.name,
    code: h.code,
    hours: h.hours,
    rate: h.rate,
    total: Math.round(h.hours * h.rate * 100) / 100,
    period: 'Tháng 10/2024',
  }
}

export function getPayrollData(scope = 'teacher') {
  const scopes = scope === 'all' ? ['teacher', 'sale', 'cs'] : [scope]
  const records = scopes.flatMap((s) => buildRecords(s).map((r) => ({ ...r, scope: s })))

  const totalHours = records.reduce((sum, r) => sum + r.hours, 0)
  const pending = records.filter((r) => r.status === 'pending')
  const confirmed = records.filter((r) => r.status === 'confirmed')

  const meta = scope === 'all'
    ? { personLabel: 'Nhân sự', workLabel: 'Công việc', unit: 'Records' }
    : SCOPE_META[scope]

  return {
    meta,
    records,
    stats: [
      {
        label: 'TOTAL TEACHING HOURS',
        value: `${totalHours.toFixed(1)} hrs`,
        sub: `Across ${records.length} faculty records`,
        icon: 'Clock',
      },
      {
        label: 'PENDING CONFIRMATION',
        value: `${pending.length} Records`,
        sub: 'Awaiting coordinator review',
        icon: 'Hourglass',
      },
      {
        label: 'CONFIRMED RECORDS',
        value: `${confirmed.length} Records`,
        sub: 'Verified for Finance dispatch',
        icon: 'CheckCircle2',
      },
    ],
  }
}