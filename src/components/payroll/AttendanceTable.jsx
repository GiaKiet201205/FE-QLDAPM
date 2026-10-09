const STATUS_STYLE = {
  'Đủ công': 'text-emerald-700 bg-emerald-50',
  'Thiếu công': 'text-red-700 bg-red-50',
  'Đi muộn': 'text-amber-700 bg-amber-50',
  'Nghỉ phép': 'text-slate-500 bg-slate-100',
}

function Badge({ value }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${STATUS_STYLE[value] || 'bg-slate-100 text-slate-600'}`}>
      {value}
    </span>
  )
}

// Dung cho GV / Sale / CS: chi xem cong cua chinh minh, theo tung ngay
export function MyAttendanceTable({ records }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Công của tôi</h3>
        <p className="text-xs text-slate-400 mt-0.5">Lịch sử chấm công gần đây</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold text-slate-400 border-b border-slate-100">
              <th className="px-5 py-2.5">NGÀY</th>
              <th className="px-5 py-2.5">GIỜ VÀO</th>
              <th className="px-5 py-2.5">GIỜ RA</th>
              <th className="px-5 py-2.5">SỐ GIỜ</th>
              <th className="px-5 py-2.5">TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3 text-slate-700 whitespace-nowrap">{r.date}</td>
                <td className="px-5 py-3 text-slate-700">{r.checkIn}</td>
                <td className="px-5 py-3 text-slate-700">{r.checkOut}</td>
                <td className="px-5 py-3 text-slate-700">{r.hours.toFixed(1)} hrs</td>
                <td className="px-5 py-3"><Badge value={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Dung cho TC / CM: xem cong cua ca team dang quan ly, tong hop theo thang
export function TeamAttendanceTable({ records, personLabel }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Công của {personLabel}</h3>
        <p className="text-xs text-slate-400 mt-0.5">Tổng hợp ngày công tháng 10/2024</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold text-slate-400 border-b border-slate-100">
              <th className="px-5 py-2.5">{personLabel.toUpperCase()}</th>
              <th className="px-5 py-2.5">NGÀY CÔNG</th>
              <th className="px-5 py-2.5">GIỜ CÔNG</th>
              <th className="px-5 py-2.5">TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3">
                  <div className="font-medium text-slate-800">{r.name}</div>
                  <div className="text-xs text-slate-400">{r.code}</div>
                </td>
                <td className="px-5 py-3 text-slate-700">{r.daysWorked} ngày</td>
                <td className="px-5 py-3 text-slate-700">{r.totalHours.toFixed(1)} hrs</td>
                <td className="px-5 py-3"><Badge value={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}