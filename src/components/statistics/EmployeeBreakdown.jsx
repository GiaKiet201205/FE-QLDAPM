import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export default function EmployeeBreakdown({ data, total }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-1">Nhân sự theo vai trò</h3>
      <p className="text-xs text-slate-400 mb-4">Tổng {total} nhân viên đang hoạt động</p>

      <div className="flex items-center gap-4">
        <div className="w-28 h-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="role"
                innerRadius={32}
                outerRadius={54}
                paddingAngle={2}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} người`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-1.5 min-w-0">
          {data.map((d) => (
            <div key={d.role} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                {d.role}
              </span>
              <span className="font-semibold text-slate-800 shrink-0">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}