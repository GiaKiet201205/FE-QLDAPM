export default function MonthlyStatsTable({ data, year }) {
  const totalRevenue = data.reduce((s, r) => s + r.revenue, 0)
  const totalSalaryCost = data.reduce((s, r) => s + r.salaryCost, 0)
  const totalProfit = totalRevenue - totalSalaryCost
  const totalNewEnrollments = data.reduce((s, r) => s + r.newEnrollments, 0)

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Bảng chi tiết theo tháng</h3>
        <span className="text-xs text-slate-400">Năm {year}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold text-slate-400 border-b border-slate-100">
              <th className="px-5 py-2.5">THÁNG</th>
              <th className="px-5 py-2.5">HV MỚI</th>
              <th className="px-5 py-2.5">TỔNG HV</th>
              <th className="px-5 py-2.5">LỚP HỌC</th>
              <th className="px-5 py-2.5">DOANH THU</th>
              <th className="px-5 py-2.5">CHI PHÍ LƯƠNG</th>
              <th className="px-5 py-2.5">LỢI NHUẬN</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.month} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                <td className="px-5 py-2.5 font-medium text-slate-700 whitespace-nowrap">{r.month}</td>
                <td className="px-5 py-2.5 text-slate-600">+{r.newEnrollments}</td>
                <td className="px-5 py-2.5 text-slate-600">{r.students.toLocaleString()}</td>
                <td className="px-5 py-2.5 text-slate-600">{r.classes}</td>
                <td className="px-5 py-2.5 text-slate-700 whitespace-nowrap">${r.revenue.toLocaleString()}</td>
                <td className="px-5 py-2.5 text-slate-700 whitespace-nowrap">${r.salaryCost.toLocaleString()}</td>
                <td className={`px-5 py-2.5 font-semibold whitespace-nowrap ${r.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ${r.profit.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-100 bg-slate-50/50 font-semibold">
              <td className="px-5 py-3 text-slate-800">Tổng cộng</td>
              <td className="px-5 py-3 text-slate-800">+{totalNewEnrollments}</td>
              <td className="px-5 py-3 text-slate-400">—</td>
              <td className="px-5 py-3 text-slate-400">—</td>
              <td className="px-5 py-3 text-slate-900 whitespace-nowrap">${totalRevenue.toLocaleString()}</td>
              <td className="px-5 py-3 text-slate-900 whitespace-nowrap">${totalSalaryCost.toLocaleString()}</td>
              <td className={`px-5 py-3 whitespace-nowrap ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ${totalProfit.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}