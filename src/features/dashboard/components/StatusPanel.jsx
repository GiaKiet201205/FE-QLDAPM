export default function StatusPanel({ title, items, role }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {items.some((i) => i.urgent) && (
          <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            {items.filter((i) => i.urgent).length} Pending
          </span>
        )}
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg border-l-4 ${
              item.urgent ? 'border-red-400 bg-red-50/50' : 'border-slate-300 bg-slate-50'
            }`}
          >
            <p className="text-sm font-medium text-slate-800 leading-snug">{item.label}</p>
            <p className={`text-xs mt-1 ${item.urgent ? 'text-red-500' : 'text-slate-400'}`}>{item.due}</p>
          </div>
        ))}
      </div>
      <button
        className="w-full mt-4 py-2.5 rounded-lg text-white text-sm font-medium"
        style={{ backgroundColor: role.color }}
      >
        Đi tới việc cần làm
      </button>
    </div>
  )
}

