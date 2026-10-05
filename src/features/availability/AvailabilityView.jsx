import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Info,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import Button from "../../components/ui/Button";
import {
  getDurationHours,
  shiftDefinitions,
  weekDayDefinitions,
} from "./mockAvailability";

const dateByDay = {
  mon: "14/10",
  tue: "15/10",
  wed: "16/10",
  thu: "17/10",
  fri: "18/10",
  sat: "19/10",
  sun: "20/10",
};

function StatusLegend({ tone, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
      <span className={"h-2 w-2 rounded-full " + tone} />
      {label}
    </span>
  );
}

function SlotCard({ slot, selected, onSelect }) {
  const pending = slot.status === "pending";
  const styleClass = selected
    ? "border-[#173557] bg-[#edf3f9] ring-1 ring-[#173557]"
    : pending
      ? "border-amber-300 bg-amber-50 hover:bg-amber-100"
      : "border-blue-200 bg-blue-50 hover:bg-blue-100";

  return (
    <button
      type="button"
      onClick={() => onSelect(slot.id)}
      className={"w-full rounded-md border px-2.5 py-2 text-left transition " + styleClass}
    >
      <span
        className={
          "mb-1 flex items-center gap-1.5 text-[11px] font-semibold " +
          (pending ? "text-amber-800" : "text-[#173557]")
        }
      >
        <span
          className={
            "h-1.5 w-1.5 rounded-full " +
            (pending ? "bg-amber-500" : "bg-blue-500")
          }
        />
        {pending ? "Chờ duyệt" : "Đã đăng ký"}
      </span>
      <span className="block text-xs font-medium text-slate-700">
        {slot.start} – {slot.end}
      </span>
    </button>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="grid grid-cols-[118px_1fr] gap-3 border-b border-slate-100 py-3 text-[13px] last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <div className="text-right font-medium text-slate-800">{children}</div>
    </div>
  );
}

export default function AvailabilityView({
  slots,
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  onResetDemo,
}) {
  const selected = slots.find((slot) => slot.id === selectedId) || null;
  const totalHours = slots.reduce(
    (sum, slot) => sum + getDurationHours(slot.start, slot.end),
    0,
  );

  return (
    <div className="font-sans text-[13px] leading-5 text-slate-800 antialiased">
      <section className="mb-4 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Đăng ký lịch rảnh
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Đăng ký và quản lý các khung giờ bạn có thể làm việc hoặc giảng dạy trong tuần.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onResetDemo}>
            <RotateCcw size={15} />
            Khôi phục mẫu
          </Button>
          <Button variant="primary" onClick={onAdd}>
            <Plus size={16} />
            Thêm lịch rảnh
          </Button>
        </div>
      </section>

      <section className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Số khung giờ
          </span>
          <strong className="mt-1 block text-2xl font-semibold text-slate-900">
            {slots.length}
          </strong>
          <span className="text-xs text-slate-500">đã đăng ký trong tuần</span>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Tổng thời lượng
          </span>
          <strong className="mt-1 block text-2xl font-semibold text-slate-900">
            {totalHours.toFixed(1)}h
          </strong>
          <span className="text-xs text-slate-500">mục tiêu gợi ý 16–22h</span>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Trạng thái
          </span>
          <strong className="mt-1 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <CheckCircle2 size={17} />
            Đã gửi lịch tuần này
          </strong>
          <span className="text-xs text-slate-500">
            {slots.filter((slot) => slot.status === "pending").length} khung giờ đang chờ duyệt
          </span>
        </div>
      </section>

      <section className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <span className="text-slate-400">Học kỳ:</span>{" "}
            <strong className="font-semibold text-slate-700">HK1 2024</strong>
          </div>
          <div className="flex items-center rounded-md border border-slate-200 bg-white">
            <button type="button" className="px-2.5 py-2 text-slate-400 hover:bg-slate-50" aria-label="Tuần trước">
              <ChevronLeft size={15} />
            </button>
            <span className="border-x border-slate-200 px-4 py-2 text-xs font-medium text-slate-700">
              Tuần 42 · 14/10 – 20/10/2024
            </span>
            <button type="button" className="px-2.5 py-2 text-slate-400 hover:bg-slate-50" aria-label="Tuần sau">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 px-1">
          <StatusLegend tone="bg-blue-500" label="Đã đăng ký" />
          <StatusLegend tone="bg-amber-500" label="Chờ duyệt" />
          <StatusLegend tone="bg-slate-300" label="Chưa đăng ký" />
        </div>
      </section>

      <div className="grid items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
            <CalendarDays size={17} className="text-blue-600" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Lịch rảnh theo tuần
            </h3>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[920px]">
              <div className="grid grid-cols-[120px_repeat(7,minmax(108px,1fr))] border-b border-slate-200 bg-slate-50">
                <div className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Ca / Giờ
                </div>
                {weekDayDefinitions.map((day) => (
                  <div key={day.key} className="border-l border-slate-200 px-2 py-2.5 text-center">
                    <strong className="block text-xs font-semibold text-slate-700">{day.label}</strong>
                    <span className="text-[11px] text-slate-400">{dateByDay[day.key]}</span>
                  </div>
                ))}
              </div>

              {shiftDefinitions.map((shift) => (
                <div
                  key={shift.key}
                  className="grid min-h-28 grid-cols-[120px_repeat(7,minmax(108px,1fr))] border-b border-slate-200 last:border-b-0"
                >
                  <div className="bg-slate-50 px-3 py-4">
                    <strong className="block text-xs font-semibold text-slate-800">{shift.label}</strong>
                    <span className="text-[11px] text-slate-400">{shift.range}</span>
                  </div>
                  {weekDayDefinitions.map((day) => {
                    const slot = slots.find(
                      (item) => item.day === day.key && item.shift === shift.key,
                    );
                    return (
                      <div key={day.key} className="flex min-h-28 items-center border-l border-slate-200 p-2">
                        {slot ? (
                          <SlotCard
                            slot={slot}
                            selected={selectedId === slot.id}
                            onSelect={onSelect}
                          />
                        ) : (
                          <div className="w-full text-center text-lg text-slate-300">—</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-1.5">
              <Info size={14} />
              Chọn một khung giờ để xem chi tiết hoặc chỉnh sửa.
            </span>
            <span>Múi giờ: GMT+7</span>
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock3 size={17} className="text-blue-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Chi tiết khung giờ
              </h3>
            </div>
            {selected && (
              <span
                className={
                  "inline-flex items-center gap-1.5 text-xs font-medium " +
                  (selected.status === "pending" ? "text-amber-700" : "text-emerald-700")
                }
              >
                <span
                  className={
                    "h-1.5 w-1.5 rounded-full " +
                    (selected.status === "pending" ? "bg-amber-500" : "bg-emerald-500")
                  }
                />
                {selected.status === "pending" ? "Chờ duyệt" : "Đã xác nhận"}
              </span>
            )}
          </div>

          {selected ? (
            <div className="p-4">
              <DetailRow label="Nhân sự">Nguyễn Phát Tín</DetailRow>
              <DetailRow label="Vai trò">Giáo viên</DetailRow>
              <DetailRow label="Ngày">
                {weekDayDefinitions.find((day) => day.key === selected.day)?.label || selected.day},
                {" "}{dateByDay[selected.day]}/2024
              </DetailRow>
              <DetailRow label="Ca">
                {shiftDefinitions.find((shift) => shift.key === selected.shift)?.label || selected.shift}
              </DetailRow>
              <DetailRow label="Khung giờ">
                {selected.start} – {selected.end} ({getDurationHours(selected.start, selected.end).toFixed(1)}h)
              </DetailRow>
              <DetailRow label="Loại">{selected.type}</DetailRow>
              <DetailRow label="Cơ sở">{selected.campus}</DetailRow>

              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Ghi chú
                </span>
                <p className="text-xs leading-5 text-slate-600">
                  {selected.note || "Không có ghi chú."}
                </p>
              </div>

              <div className="mt-4 grid gap-2">
                <Button variant="primary" onClick={() => onEdit(selected)}>
                  <Pencil size={15} />
                  Chỉnh sửa lịch rảnh
                </Button>
                <Button className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => onDelete(selected.id)}>
                  <Trash2 size={15} />
                  Xóa lịch rảnh
                </Button>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Lịch sử gần đây
                </span>
                <div className="flex justify-between gap-3 py-1 text-xs text-slate-500">
                  <span>Đã gửi đăng ký</span>
                  <span>{selected.submittedAt}</span>
                </div>
                {selected.reviewedAt && (
                  <div className="flex justify-between gap-3 py-1 text-xs text-slate-500">
                    <span>Đã duyệt</span>
                    <span>{selected.reviewedAt}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <CalendarDays size={30} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">Chưa chọn khung giờ</p>
              <p className="mt-1 text-xs text-slate-400">
                Nhấn vào một ô đã đăng ký trong lịch để xem thông tin chi tiết.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
