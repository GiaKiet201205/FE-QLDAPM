import { useEffect, useMemo, useState } from "react";
import { classApi } from "../../services/classApi";

const field =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800";
const action =
  "rounded-md border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-50 disabled:opacity-40";
const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function dateOnly(value) {
  return String(value ?? "").slice(0, 10);
}

function slotKey(slot) {
  return `${dateOnly(slot.date)}|${String(slot.startTime).slice(0, 5)}|${String(slot.endTime).slice(0, 5)}`;
}

function normalized(slot) {
  return {
    date: dateOnly(slot.date),
    startTime: String(slot.startTime).slice(0, 5),
    endTime: String(slot.endTime).slice(0, 5),
  };
}

function formatDay(value) {
  const date = new Date(`${value}T12:00:00`);
  return `${dayNames[date.getDay()]} · ${value}`;
}

// DRAFT can be saved without a timetable; READY requires planned sessions.
// A timetable belongs to the class, never to a particular teacher.
export default function PlannedClassSessions({
  classItem,
  canManage,
  teachingSchedules = [],
  supportSchedules = [],
}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [weekday, setWeekday] = useState("1");
  const [from, setFrom] = useState("18:00");
  const [to, setTo] = useState("20:00");
  const [singleDate, setSingleDate] = useState(classItem.startDate);
  const editable = canManage && ["DRAFT", "READY"].includes(classItem.status);

  useEffect(() => {
    let active = true;
    setSessions([]);
    setLoading(true);
    setError("");
    setDirty(false);
    setSingleDate(classItem.startDate);
    classApi.plannedSessions(classItem.id)
      .then((items) => {
        if (active) setSessions((items || []).map(normalized));
      })
      .catch((err) => {
        if (active) setError(err.message || "Không tải được lịch lớp.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [classItem.id, classItem.startDate]);

  const arranged = useMemo(
    () => [...sessions].sort((a, b) => slotKey(a).localeCompare(slotKey(b))),
    [sessions],
  );

  const assigned = useMemo(() => new Set(
    [...teachingSchedules, ...supportSchedules]
      .filter((item) => item.status === "ASSIGNED")
      .map(slotKey),
  ), [teachingSchedules, supportSchedules]);

  function append(items) {
    setError("");
    setMessage("");
    setSessions((current) => {
      const result = [...current];
      const keys = new Set(current.map(slotKey));
      for (const item of items) {
        if (!keys.has(slotKey(item))) {
          result.push(item);
          keys.add(slotKey(item));
        }
      }
      return result;
    });
    setDirty(true);
  }

  function validate() {
    if (!from || !to || from >= to) {
      setError("Giờ kết thúc phải sau giờ bắt đầu.");
      return false;
    }
    return true;
  }

  function addRecurring() {
    if (!validate()) return;
    const start = new Date(`${classItem.startDate}T12:00:00`);
    const end = new Date(`${classItem.endDate}T12:00:00`);
    const result = [];
    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      if (day.getDay() === Number(weekday)) {
        const date = [
          day.getFullYear(),
          String(day.getMonth() + 1).padStart(2, "0"),
          String(day.getDate()).padStart(2, "0"),
        ].join("-");
        result.push({ date, startTime: from, endTime: to });
      }
    }
    append(result);
  }

  function addOneOff() {
    if (!validate()) return;
    if (singleDate < classItem.startDate || singleDate > classItem.endDate) {
      setError("Ngày bổ sung phải nằm trong khoảng thời gian của lớp.");
      return;
    }
    append([{ date: singleDate, startTime: from, endTime: to }]);
  }

  function remove(item) {
    if (assigned.has(slotKey(item))) {
      setError("Buổi học đã có phân công. TC/CM phải hủy phân công trước khi đổi lịch.");
      return;
    }
    setSessions((current) => current.filter((row) => slotKey(row) !== slotKey(item)));
    setDirty(true);
    setError("");
    setMessage("");
  }

  async function save() {
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const result = await classApi.savePlannedSessions(classItem.id, arranged);
      setSessions((result || []).map(normalized));
      setDirty(false);
      setMessage("Đã lưu lịch học dự kiến vào PostgreSQL. TC/CM có thể dùng các buổi này để phân công.");
    } catch (e) {
      setError(e?.message ?? "Không lưu được lịch học.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Lịch học của lớp (chưa gắn giáo viên)</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Admin/CS lập lịch trước. Chỉ khi có ít nhất một buổi mới chuyển lớp sang READY.
          TC và CM phân công nhân sự dựa trên đúng các buổi này.
        </p>
      </div>
      {loading ? <p className="text-xs">Đang tải lịch...</p> : null}
      {error ? <p role="alert" className="text-xs text-red-700">{error}</p> : null}
      {message ? <p role="status" className="text-xs text-emerald-700">{message}</p> : null}

      {editable && !loading ? (
        <div className="space-y-2 rounded-md bg-slate-50 p-2">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs">Giờ bắt đầu
              <input className={field} type="time" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="text-xs">Giờ kết thúc
              <input className={field} type="time" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
            <label className="text-xs">Thứ trong tuần
              <select className={field} value={weekday} onChange={(e) => setWeekday(e.target.value)}>
                {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                  <option key={day} value={String(day)}>{dayNames[day]}</option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button type="button" className={action} onClick={addRecurring}>
                Thêm các buổi hàng tuần
              </button>
            </div>
            <label className="text-xs">Ngày học bổ sung
              <input className={field} type="date" min={classItem.startDate}
                max={classItem.endDate} value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)} />
            </label>
            <div className="flex items-end">
              <button type="button" className={action} onClick={addOneOff}>
                Thêm một buổi riêng
              </button>
            </div>
          </div>
          <button type="button" className={action} disabled={!dirty || saving} onClick={save}>
            {saving ? "Đang lưu..." : "Lưu lịch dự kiến"}
          </button>
          {dirty ? <span className="ml-2 text-xs text-amber-700">Có thay đổi chưa lưu</span> : null}
        </div>
      ) : null}

      <div className="max-h-72 space-y-1 overflow-y-auto">
        {arranged.map((item) => (
          <div key={slotKey(item)}
            className="flex items-center justify-between gap-2 rounded border border-slate-100 px-2 py-1.5 text-xs">
            <span>{formatDay(item.date)} · {item.startTime}–{item.endTime}</span>
            <div className="flex items-center gap-2">
              {assigned.has(slotKey(item)) ?
                <span className="text-emerald-700">Đã phân công</span> :
                <span className="text-slate-500">Chưa phân công</span>}
              {editable ?
                <button type="button" className="text-red-600 hover:underline"
                  onClick={() => remove(item)}>Bỏ</button> : null}
            </div>
          </div>
        ))}
        {!arranged.length && !loading ?
          <p className="py-2 text-xs text-slate-500">Chưa có lịch học dự kiến.</p> : null}
      </div>
    </section>
  );
}
