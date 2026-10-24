import { useEffect, useMemo, useRef, useState } from "react";
import { classApi } from "../../services/classApi";

const inputClass = "h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-700";
const dateOnly = (value) => String(value ?? "").slice(0, 10);
const timeOnly = (value) => String(value ?? "").slice(0, 5);

/**
 * Staff a class's actual planned lessons rather than generating independent shifts.
 * Default to the whole course, even if the weekly calendar is showing another week.
 * Every selected lesson is checked again on the server, in a single transaction.
 */
export default function RangeStaffingPanel({
  role, classId, employeeId, employeeName, campus, workplaceId,
  singleSessionId, onApplied,
}) {
  const [scope, setScope] = useState("COURSE");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [replace, setReplace] = useState(false);
  const [coverage, setCoverage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [revision, setRevision] = useState(0);
  const previousClass = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setCoverage([]);
    setError("");
    if (previousClass.current !== classId) {
      previousClass.current = classId;
      setScope("COURSE");
      setMessage("");
      setReplace(false);
    }
    if (!classId) {
      setLoading(false);
      return () => { active = false; };
    }
    classApi.staffingCoverage(classId, role).then((data) => {
      if (!active) return;
      const rows = Array.isArray(data) ? data : [];
      setCoverage(rows);
      if (rows.length) {
        setFrom(dateOnly(rows[0].date));
        setTo(dateOnly(rows[rows.length - 1].date));
      }
    }).catch((e) => {
      if (active) setError(e?.message || "Không lấy được tình trạng phân công của lớp.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [classId, role, revision]);

  const matching = useMemo(() => coverage.filter((slot) => {
    if (scope === "SINGLE") return slot.id === singleSessionId;
    if (scope === "PERIOD") return from && to && from <= to &&
      dateOnly(slot.date) >= from && dateOnly(slot.date) <= to;
    return true;
  }), [coverage, scope, singleSessionId, from, to]);

  const selected = useMemo(() => matching.filter((slot) => {
    if (replace) return slot.employeeId !== employeeId;
    return !slot.assignmentId;
  }), [matching, replace, employeeId]);

  const occupied = matching.filter((slot) => Boolean(slot.assignmentId)).length;
  const otherAssigned = matching.filter((slot) =>
    slot.assignmentId && slot.employeeId !== employeeId).length;
  const manyAssigned = matching.filter((slot) => Number(slot.assignedCount) > 1).length;

  async function applyRange() {
    if (!classId || !employeeId || !selected.length || saving) return;
    if (replace && !window.confirm(
      `Thay nhân sự cho ${selected.length} buổi được chọn? Các buổi khác và lịch sử điểm danh vẫn giữ nguyên.`
    )) return;

    setSaving(true);
    setMessage("");
    setError("");
    try {
      const result = await classApi.assignStaffingRange(classId, {
        role, employeeId, campus, workplaceId,
        mode: replace ? "REPLACE" : "FILL_EMPTY",
        sessionIds: selected.map((slot) => slot.id),
      });
      setMessage(`Đã phân công ${result.createdCount} buổi cho ${employeeName || employeeId}.`);
      setRevision((previous) => previous + 1);
      await onApplied?.();
    } catch (e) {
      setError((e?.message || "Không thể lưu phân công.") +
        " Không có buổi nào trong đợt được lưu nếu giao dịch thất bại.");
    } finally {
      setSaving(false);
    }
  }

  const noun = role === "TEACHER" ? "giáo viên" : "CS hỗ trợ";
  return (
    <section className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/40 p-3"
      aria-label={`Phân công ${noun} theo khóa hoặc giai đoạn`}>
      <div>
        <strong className="block text-sm text-slate-900">Phân công {noun} theo lịch lớp</strong>
        <p className="mt-1 text-[11px] text-slate-500">
          Mặc định phân công toàn khóa. Chỉ lấy các buổi đã lập kế hoạch;
          hệ thống kiểm tra lịch rảnh và lịch trùng của từng buổi khi lưu.
        </p>
      </div>

      <label className="block text-xs text-slate-700">Phạm vi phân công
        <select className={inputClass + " mt-1"} value={scope}
          onChange={(event) => { setScope(event.target.value); setError(""); setMessage(""); }}>
          <option value="COURSE">Toàn bộ khóa học (mặc định)</option>
          <option value="PERIOD">Theo khoảng ngày / nhiều tuần / tháng</option>
          <option value="SINGLE">Một buổi đã chọn trong lịch tuần</option>
        </select>
      </label>

      {scope === "PERIOD" && (
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-slate-600">Từ ngày
            <input className={inputClass + " mt-1"} type="date" value={from}
              onChange={(event) => setFrom(event.target.value)} />
          </label>
          <label className="text-xs text-slate-600">Đến ngày
            <input className={inputClass + " mt-1"} type="date" value={to}
              min={from || undefined} onChange={(event) => setTo(event.target.value)} />
          </label>
        </div>
      )}
      {scope === "SINGLE" && !singleSessionId && (
        <p className="text-[11px] text-amber-700">
          Hãy chọn một buổi học trong lịch tuần đang xem ở phía trên.
        </p>
      )}

      <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-700">
        <input type="checkbox" className="mt-0.5" checked={replace}
          onChange={(event) => setReplace(event.target.checked)} />
        <span><strong>Thay nhân sự đã phân công</strong> ở các buổi thuộc phạm vi này.
          Bỏ chọn để chỉ phân công những buổi còn trống.</span>
      </label>

      <div className="rounded-md border border-slate-200 bg-white p-2 text-[11px] text-slate-600">
        {loading ? "Đang tải toàn bộ lịch lớp…" : (
          <>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <span>Tổng trong phạm vi: <strong>{matching.length}</strong></span>
              <span>Đã có người: <strong>{occupied}</strong></span>
              <span>Sẽ {replace ? "thay / bổ sung" : "phân công"}: <strong>{selected.length}</strong></span>
            </div>
            {otherAssigned > 0 && !replace && (
              <p className="mt-1 text-amber-700">{otherAssigned} buổi đã có người khác,
                sẽ không bị ghi đè.</p>
            )}
            {manyAssigned > 0 && replace && (
              <p className="mt-1 text-amber-700">
                Có {manyAssigned} buổi có nhiều người được phân công;
                cần xử lý riêng những buổi đó.</p>
            )}
            {selected.length > 0 && (
              <p className="mt-1 text-slate-500">
                {selected.slice(0, 5).map((slot) =>
                  `${dateOnly(slot.date)} ${timeOnly(slot.startTime)}–${timeOnly(slot.endTime)}`
                ).join(" · ")}
                {selected.length > 5 ? ` · và ${selected.length - 5} buổi khác` : ""}
              </p>
            )}
          </>
        )}
      </div>

      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      {message && <p role="status" className="text-xs text-emerald-700">{message}</p>}
      <button type="button" onClick={applyRange}
        disabled={!classId || !employeeId || loading || saving || !selected.length || selected.length > 400 || (scope === "PERIOD" && from > to)}
        className="w-full rounded-md bg-[#173557] px-3 py-2 text-xs font-semibold text-white hover:bg-[#22486f] disabled:cursor-not-allowed disabled:opacity-40">
        {saving ? "Đang lưu…" :
          `Xác nhận ${replace ? "thay / phân công" : "phân công"} ${selected.length} buổi`}
      </button>
    </section>
  );
}
