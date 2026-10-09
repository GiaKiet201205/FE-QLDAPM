// Du lieu mau cho phan "Cong" (cham cong / ngay-gio lam viec thuc te) - tach rieng voi so tien luong

const MY_ATTENDANCE = {
  TEACHER: [
    { date: '14/10/2024', checkIn: '08:15', checkOut: '16:30', hours: 8.0, status: 'Đủ công' },
    { date: '13/10/2024', checkIn: '08:20', checkOut: '16:25', hours: 7.9, status: 'Đủ công' },
    { date: '12/10/2024', checkIn: '—', checkOut: '—', hours: 0, status: 'Nghỉ phép' },
    { date: '11/10/2024', checkIn: '08:40', checkOut: '16:30', hours: 7.8, status: 'Đi muộn' },
    { date: '10/10/2024', checkIn: '08:10', checkOut: '16:30', hours: 8.2, status: 'Đủ công' },
  ],
  SALE: [
    { date: '14/10/2024', checkIn: '07:30', checkOut: '15:30', hours: 8.0, status: 'Đủ công' },
    { date: '13/10/2024', checkIn: '07:35', checkOut: '15:30', hours: 7.9, status: 'Đủ công' },
    { date: '12/10/2024', checkIn: '07:45', checkOut: '15:30', hours: 7.75, status: 'Đi muộn' },
    { date: '11/10/2024', checkIn: '07:30', checkOut: '15:30', hours: 8.0, status: 'Đủ công' },
  ],
  CS: [
    { date: '14/10/2024', checkIn: '08:00', checkOut: '16:00', hours: 8.0, status: 'Đủ công' },
    { date: '13/10/2024', checkIn: '—', checkOut: '—', hours: 0, status: 'Nghỉ phép' },
    { date: '12/10/2024', checkIn: '08:05', checkOut: '16:00', hours: 7.9, status: 'Đủ công' },
  ],
}

const TEAM_ATTENDANCE = {
  teacher: [
    { name: 'David Miller', code: 'FAC-1092', daysWorked: 22, totalHours: 176.0, status: 'Đủ công' },
    { name: 'Nguyen Van An', code: 'FAC-1180', daysWorked: 16, totalHours: 128.0, status: 'Thiếu công' },
    { name: 'Sarah Jenkins', code: 'FAC-1144', daysWorked: 21, totalHours: 168.0, status: 'Đủ công' },
    { name: 'Emily Watson', code: 'FAC-1205', daysWorked: 18, totalHours: 144.0, status: 'Thiếu công' },
    { name: 'Tran Quoc Bao', code: 'FAC-1162', daysWorked: 20, totalHours: 160.0, status: 'Đủ công' },
    { name: 'Michael Scott', code: 'FAC-1055', daysWorked: 22, totalHours: 176.0, status: 'Đủ công' },
  ],
  sale: [
    { name: 'Tran Minh Anh', code: 'SAL-2031', daysWorked: 22, totalHours: 176.0, status: 'Đủ công' },
    { name: 'Pham Thi Hoa', code: 'SAL-2048', daysWorked: 17, totalHours: 136.0, status: 'Thiếu công' },
    { name: 'Le Van Tu', code: 'SAL-2052', daysWorked: 22, totalHours: 176.0, status: 'Đủ công' },
  ],
  cs: [
    { name: 'Le Quoc Huy', code: 'CS-3011', daysWorked: 22, totalHours: 176.0, status: 'Đủ công' },
    { name: 'Nguyen Thi Mai', code: 'CS-3022', daysWorked: 14, totalHours: 112.0, status: 'Thiếu công' },
  ],
}

export function getMyAttendance(roleKey) {
  return MY_ATTENDANCE[roleKey] || MY_ATTENDANCE.TEACHER
}

export function getTeamAttendance(scope) {
  if (scope === 'all') {
    return [...TEAM_ATTENDANCE.teacher, ...TEAM_ATTENDANCE.sale, ...TEAM_ATTENDANCE.cs]
  }
  return TEAM_ATTENDANCE[scope] || []
}