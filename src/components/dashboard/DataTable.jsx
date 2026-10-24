const STATUS_STYLES = {
  'Confirmed': 'bg-emerald-50 text-emerald-700',
  'Đã xác nhận': 'bg-emerald-50 text-emerald-700',
  'In Progress': 'bg-blue-50 text-blue-700',
  'Đang làm': 'bg-blue-50 text-blue-700',
  'Đang học': 'bg-blue-50 text-blue-700',
  'Chờ duyệt': 'bg-amber-50 text-amber-700',
  'Trống': 'bg-slate-100 text-slate-500',
  'Xung đột': 'bg-red-50 text-red-700',
  'Thiếu dữ liệu GV': 'bg-red-50 text-red-700',
}

function StatusBadge({ value }) {
  const style = STATUS_STYLES[value] || 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${style}`}>
      {(value === 'In Progress' || value === 'Đang làm' || value === 'Đang học') && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      )}
      {value}
    </span>
  )
}

export default function DataTable({ title, columns, rows, viewAllLabel }) {
  const statusColIndex = columns.findIndex((c) => c.toLowerCase().includes('trạng thái') || c === 'Status')

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold text-slate-400 border-b border-slate-100">
              {columns.map((c, i) => (
                <th key={i} className="px-5 py-2.5 font-semibold whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-5 py-3 text-slate-700 whitespace-nowrap">
                    {ci === statusColIndex ? (
                      <StatusBadge value={cell} />
                    ) : ci === row.length - 1 ? (
                      <button className="text-blue-600 font-medium hover:underline">{cell}</button>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {viewAllLabel && (
        <div className="px-5 py-3 border-t border-slate-100">
          <button className="text-xs font-medium text-blue-600 hover:underline">{viewAllLabel} →</button>
        </div>
      )}
    </div>
  )
}
