import { useCallback, useEffect, useMemo, useState } from "react";
import { classApi } from "../../services/classApi";
import { schedulingApi } from "../../services/api";
import { addDays, iso, mondayOf } from "./schedulingUtils";

function key(row) {
  return [
    row.classId,
    String(row.date).slice(0,10),
    String(row.startTime).slice(0,5),
    String(row.endTime).slice(0,5),
  ].join("|");
}

export default function ScheduleMonitor() {
  const [week, setWeek] = useState(() => mondayOf());
  const [classes, setClasses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [teaching, setTeaching] = useState([]);
  const [support, setSupport] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [classRows, teacherRows, csRows] = await Promise.all([
        classApi.planningClasses(),
        schedulingApi.teaching(iso(week)),
        schedulingApi.staff(null, iso(week)),
      ]);
      const rows = Array.isArray(classRows) ? classRows : [];
      const sessions = await Promise.all(rows.map(async (item) => {
        const plan = await classApi.plannedSessions(item.classId);
        return (plan || []).filter((slot) =>
          slot.status === "PLANNED" &&
          String(slot.date).slice(0,10) >= iso(week) &&
          String(slot.date).slice(0,10) <= iso(addDays(week,6))
        ).map((slot) => ({ ...slot, classId: item.classId }));
      }));
      setClasses(rows);
      setLessons(sessions.flat().sort((a,b) => key(a).localeCompare(key(b))));
      setTeaching((teacherRows || []).filter((row) => row.status === "ASSIGNED"));
      setSupport((csRows || []).filter((row) =>
        row.status === "ASSIGNED" && row.workType === "CLASS_SUPPORT"));
    } catch(e) {
      setError(e.message || "Không tải được lịch phân công.");
    } finally {
      setLoading(false);
    }
  }, [week]);

  useEffect(() => { refresh(); }, [refresh]);

  const teacherBySlot = useMemo(() => new Map(teaching.map((row) => [key(row),row])), [teaching]);
  const supportBySlot = useMemo(() => new Map(support.map((row) => [key(row),row])), [support]);
  const visible = lessons.filter((lesson) =>
    !filter || lesson.classId === filter);
  const missingTeacher = visible.filter((lesson) => !teacherBySlot.has(key(lesson))).length;
  const missingSupport = visible.filter((lesson) => !supportBySlot.has(key(lesson))).length;

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Giám sát lịch lớp và phân công</h2>
        <p className="mt-1 text-sm text-slate-500">
          Admin xem buổi học dự kiến, giáo viên đã được TC phân công và CS do CM bố trí.
        </p>
      </header>
      <section className="flex flex-wrap items-center gap-2 rounded-lg border bg-white p-3">
        <button className="rounded-md border px-3 py-2 text-sm" onClick={() => setWeek(addDays(week,-7))}>
          ← Tuần trước
        </button>
        <span className="text-sm font-medium">{iso(week)} – {iso(addDays(week,6))}</span>
        <button className="rounded-md border px-3 py-2 text-sm" onClick={() => setWeek(addDays(week,7))}>
          Tuần sau →
        </button>
        <select className="ml-auto rounded-md border px-3 py-2 text-sm"
          value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Tất cả lớp</option>
          {classes.map((item) => (
            <option key={item.classId} value={item.classId}>
              {item.classCode} · {item.name}
            </option>
          ))}
        </select>
        <button onClick={refresh} className="rounded-md border px-3 py-2 text-sm">Làm mới</button>
      </section>
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Buổi học dự kiến", visible.length],
          ["Buổi thiếu giáo viên", missingTeacher],
          ["Buổi chưa có CS hỗ trợ", missingSupport],
        ].map(([label,count]) => (
          <div key={label} className="rounded-lg border bg-white p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <strong className="block text-2xl text-slate-900">{count}</strong>
          </div>
        ))}
      </div>
      <section className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-[700px] w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs text-slate-600">
            <tr>
              <th className="p-3">Lớp</th>
              <th className="p-3">Ngày / giờ</th>
              <th className="p-3">Teacher</th>
              <th className="p-3">CS hỗ trợ</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((lesson) => {
              const item = classes.find((c) => c.classId === lesson.classId);
              const teacher = teacherBySlot.get(key(lesson));
              const cs = supportBySlot.get(key(lesson));
              return (
                <tr key={lesson.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{item?.classCode || lesson.classId}</td>
                  <td className="p-3">{String(lesson.date).slice(0,10)} · {String(lesson.startTime).slice(0,5)}–{String(lesson.endTime).slice(0,5)}</td>
                  <td className={`p-3 ${teacher ? "text-emerald-700" : "text-amber-700"}`}>
                    {teacher ? teacher.teacherName : "Chưa phân công"}
                  </td>
                  <td className={`p-3 ${cs ? "text-emerald-700" : "text-slate-500"}`}>
                    {cs ? cs.employeeName : "Chưa phân công"}
                  </td>
                </tr>
              );
            })}
            {!visible.length && !loading ?
              <tr><td colSpan={4} className="p-5 text-center text-slate-500">Không có buổi học dự kiến trong tuần.</td></tr> : null}
          </tbody>
        </table>
      </section>
      {loading ? <p className="text-xs text-slate-500">Đang đồng bộ lịch từ BE...</p> : null}
      <p className="text-xs text-slate-500">
        CS hỗ trợ có thể không bắt buộc cho mọi buổi. Bộ đếm thể hiện số buổi chưa được CM bố trí CS.
      </p>
    </div>
  );
}
