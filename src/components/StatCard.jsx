export default function StatCard({ label, value, trend, trendUp }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="text-[11px] font-semibold tracking-wide text-slate-400 mb-2">{label}</div>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
      <div className={`text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-amber-600'}`}>
        {trend}
      </div>
    </div>
  )
}
