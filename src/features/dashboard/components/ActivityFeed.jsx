export function ActivityFeed({ activities }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Hoạt động gần đây</h3>
        <button className="text-xs font-medium text-blue-600 hover:underline">Xem tất cả</button>
      </div>
      <ul className="px-5 py-2">
        {activities.map((a, i) => (
          <li key={i} className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-slate-700 leading-snug">{a.text}</p>
              <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}


