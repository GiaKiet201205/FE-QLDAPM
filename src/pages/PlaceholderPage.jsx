import { Construction } from 'lucide-react'

export default function PlaceholderPage({ title }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Construction size={20} className="text-slate-400" />
      </div>
      <h2 className="text-base font-semibold text-slate-800 mb-1">{title}</h2>
      <p className="text-sm text-slate-400 max-w-sm">
        Chức năng này đang được xây dựng. Điều hướng và sidebar đã sẵn sàng, nội dung chi tiết sẽ được bổ sung ở bước tiếp theo.
      </p>
    </div>
  )
}
