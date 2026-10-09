import { Wallet } from 'lucide-react'

export default function MySalaryCard({ mySalary }) {
  if (mySalary.payType === 'fixed') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-wide text-slate-400 mb-1">
            LƯƠNG CỐ ĐỊNH · {mySalary.period}
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ${mySalary.amount.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Lương cứng hàng tháng, không tính theo giờ</div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
          <Wallet size={18} />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] font-semibold tracking-wide text-slate-400">
          LƯƠNG CỦA TÔI · {mySalary.period}
        </div>
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
          <Wallet size={16} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-[11px] text-slate-400 mb-0.5">Số giờ</div>
          <div className="text-lg font-bold text-slate-900">{mySalary.hours.toFixed(1)} hrs</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-400 mb-0.5">Đơn giá</div>
          <div className="text-lg font-bold text-slate-900">${mySalary.rate.toFixed(2)}/hr</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-400 mb-0.5">Thành tiền</div>
          <div className="text-lg font-bold text-emerald-600">${mySalary.total.toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}