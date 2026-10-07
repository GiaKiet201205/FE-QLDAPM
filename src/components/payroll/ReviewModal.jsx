import { X } from 'lucide-react'

export default function ReviewModal({ record, mode, onClose, onConfirm, onReject }) {
  if (!record) return null

  // mode 'manage' (TC/CM): xac nhan cong luong truoc khi gui Finance
  // mode 'approve' (Admin): duyet/tu choi lan cuoi
  const confirmLabel = mode === 'approve' ? 'Phê duyệt' : 'Xác nhận'
  const rejectLabel = 'Từ chối'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">
            {mode === 'approve' ? 'Phê duyệt công lương' : 'Xác nhận công lương'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
              {record.name.split(' ').slice(-2).map((w) => w[0]).join('')}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">{record.name}</div>
              <div className="text-xs text-slate-400">{record.code}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-[11px] text-slate-400">Số giờ</div>
              <div className="text-sm font-semibold text-slate-800">{record.hours.toFixed(1)} hrs</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-[11px] text-slate-400">Đơn giá</div>
              <div className="text-sm font-semibold text-slate-800">${record.rate.toFixed(2)}/hr</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 col-span-2">
              <div className="text-[11px] text-slate-400">Thành tiền</div>
              <div className="text-base font-bold text-slate-900">${record.total.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-slate-100">
          <button
            onClick={() => onReject(record)}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100"
          >
            {rejectLabel}
          </button>
          <button
            onClick={() => onConfirm(record)}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}