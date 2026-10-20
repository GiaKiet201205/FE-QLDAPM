import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { apiRequest, schedulingApi } from "../../services/api";
import {
  csWorkTypes,
  saleWorkTypes,
  workplaceOptions,
} from "./mockStaffAssignment";
import { addDays, iso, mondayOf } from "./schedulingUtils";
import {
  buildWeekDays,
  formatWeekLabel,
  normalizeClass,
  normalizeSchedule,
} from "./schedulingApiAdapters";

const shifts = [
  { key: "morning", label: "Buổi sáng", start: "08:00", end: "12:00" },
  { key: "afternoon", label: "Buổi chiều", start: "13:00", end: "18:00" },
  { key: "evening", label: "Buổi tối", start: "18:00", end: "22:00" },
];

function getShift(startTime) {
  if (startTime < "12:00") return "morning";
  if (startTime < "18:00") return "afternoon";
  return "evening";
}

function getWorkTypeLabel(role, value) {
  const source = role === "SALE" ? saleWorkTypes : csWorkTypes;
  return source.find((item) => item.value === value)?.label ?? value ?? "Ca làm việc";
}

export default function MyScheduleView({ roleKey }) {
  const [weekStart, setWeekStart] = useState(() => mondayOf());
  const [rows, setRows] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isTeacher = roleKey === "TEACHER";
  const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [scheduleRows, classRows] = await Promise.all([
        schedulingApi.ownSchedule(iso(weekStart)),
        apiRequest("/classes").catch(() => []),
      ]);

      const nextRows = (Array.isArray(scheduleRows) ? scheduleRows : []).map(
        (row) => normalizeSchedule(row, roleKey),
      );
      const nextClasses = (Array.isArray(classRows) ? classRows : []).map(
        normalizeClass,
      );

      setRows(nextRows);
      setClasses(nextClasses);
      setSelectedId((current) =>
        nextRows.some((item) => item.id === current)
          ? current
          : nextRows[0]?.id || null,
      );
    } catch (requestError) {
      setRows([]);
      setSelectedId(null);
      setError(requestError?.message || "Không thể tải lịch cá nhân.");
    } finally {
      setLoading(false);
    }
  }, [roleKey, weekStart]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const schedules = useMemo(() => {
    return rows
      .map((item) => {
        const classItem = item.classId
          ? classes.find((cls) => cls.id === item.classId)
          : null;

        if (isTeacher) {
          return {
            ...item,
            title:
              item.className ||
              classItem?.name ||
              item.classCode ||
              classItem?.classCode ||
              "Lớp học",
            subtitle: item.classCode || classItem?.classCode || "",
            place:
              item.room ||
              item.campus ||
              item.workplaceName ||
              "Cơ sở chính",
            kind: "TEACHING",
          };
        }

        const workplace =
          item.workplaceName ||
          workplaceOptions.find((place) => place.id === item.workplaceId)?.label ||
          item.campus ||
          "Cơ sở chính";

        return {
          ...item,
          title: getWorkTypeLabel(roleKey, item.workType),
          subtitle: classItem?.classCode || item.classCode || roleKey,
          place: workplace,
          kind: "WORK",
        };
      })
      .filter((item) =>
        (item.title + " " + item.subtitle + " " + item.place)
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
  }, [rows, classes, isTeacher, roleKey, search]);

  const selected =
    schedules.find((item) => item.id === selectedId) ?? schedules[0] ?? null;

  return (
    <div className="space-y-4 font-sans text-[13px] leading-5 text-slate-800 antialiased">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              {isTeacher ? "Lịch dạy của tôi" : "Lịch làm việc của tôi"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isTeacher
                ? "Theo dõi các buổi dạy đã được Teaching Coordinator phân công."
                : "Theo dõi các ca làm đã được Center Management phân công."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-9 min-w-56 items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 text-slate-400">
              <Search size={15} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={isTeacher ? "Tìm lớp, phòng..." : "Tìm công việc, cơ sở..."}
                className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-700 outline-none"
              />
            </div>

            <div className="flex items-center rounded-md border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setWeekStart((current) => addDays(current, -7))}
                className="px-2.5 py-2 text-slate-400 hover:bg-slate-50"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="border-x border-slate-200 px-4 py-2 text-xs font-medium text-slate-700">
                {formatWeekLabel(weekStart)}
              </span>
              <button
                type="button"
                onClick={() => setWeekStart((current) => addDays(current, 7))}
                className="px-2.5 py-2 text-slate-400 hover:bg-slate-50"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {(loading || error) && (
        <div
          className={
            "rounded-lg border px-4 py-3 text-sm " +
            (error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-slate-200 bg-white text-slate-500")
          }
        >
          {error || "Đang tải lịch..."}
        </div>
      )}

      <div className="grid items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[930px]">
              <div className="grid grid-cols-[120px_repeat(7,minmax(110px,1fr))] border-b border-slate-200 bg-slate-50">
                <div className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Ca
                </div>
                {weekDays.map((day) => (
                  <div key={day.key} className="border-l border-slate-200 px-2 py-2.5 text-center">
                    <strong className="block text-xs text-slate-700">{day.label}</strong>
                    <span className="text-[11px] text-slate-400">{day.displayDate}</span>
                  </div>
                ))}
              </div>

              {shifts.map((shift) => (
                <div
                  key={shift.key}
                  className="grid min-h-32 grid-cols-[120px_repeat(7,minmax(110px,1fr))] border-b border-slate-200 last:border-b-0"
                >
                  <div className="bg-slate-50 px-3 py-4">
                    <strong className="block text-xs font-semibold text-slate-800">
                      {shift.label}
                    </strong>
                    <span className="text-[11px] text-slate-400">
                      {shift.start}–{shift.end}
                    </span>
                  </div>

                  {weekDays.map((day) => {
                    const daySchedules = schedules.filter(
                      (item) =>
                        item.date === day.date &&
                        getShift(item.startTime) === shift.key,
                    );

                    return (
                      <div key={day.key} className="space-y-2 border-l border-slate-200 p-2">
                        {daySchedules.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            className={
                              "w-full rounded-md border px-2 py-2 text-left transition " +
                              (selected?.id === item.id
                                ? "border-[#173557] bg-[#eaf1f8] ring-1 ring-[#173557]"
                                : "border-blue-200 bg-blue-50 hover:bg-blue-100")
                            }
                          >
                            <span className="block text-[11px] font-semibold text-[#173557]">
                              {item.startTime}–{item.endTime}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] font-medium text-slate-700">
                              {item.title}
                            </span>
                            <span className="block truncate text-[10px] text-slate-500">
                              {item.place}
                            </span>
                          </button>
                        ))}

                        {!daySchedules.length && (
                          <div className="pt-10 text-center text-xs text-slate-300">
                            Không có lịch
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
            <CalendarDays size={17} className="text-blue-600" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              {isTeacher ? "Chi tiết buổi dạy" : "Chi tiết ca làm"}
            </h3>
          </div>

          {selected ? (
            <div className="p-4">
              <div className="mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {isTeacher ? "Lớp" : "Công việc"}
                </span>
                <h4 className="mt-1 text-base font-semibold text-slate-900">
                  {selected.title}
                </h4>
                <p className="text-xs text-slate-500">{selected.subtitle}</p>
              </div>

              <div className="space-y-0 border-t border-slate-100">
                <div className="flex items-start gap-3 border-b border-slate-100 py-3">
                  <Clock3 size={15} className="mt-0.5 text-slate-400" />
                  <div>
                    <span className="block text-[11px] uppercase tracking-wide text-slate-400">
                      Thời gian
                    </span>
                    <strong className="text-xs font-medium text-slate-800">
                      {selected.date} · {selected.startTime}–{selected.endTime}
                    </strong>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-b border-slate-100 py-3">
                  <MapPin size={15} className="mt-0.5 text-slate-400" />
                  <div>
                    <span className="block text-[11px] uppercase tracking-wide text-slate-400">
                      Địa điểm
                    </span>
                    <strong className="text-xs font-medium text-slate-800">
                      {selected.place}
                    </strong>
                  </div>
                </div>

                {isTeacher && (
                  <div className="flex items-start gap-3 py-3">
                    <Users size={15} className="mt-0.5 text-slate-400" />
                    <div>
                      <span className="block text-[11px] uppercase tracking-wide text-slate-400">
                        Trạng thái
                      </span>
                      <strong className="text-xs font-medium text-emerald-700">
                        Đã được phân công
                      </strong>
                    </div>
                  </div>
                )}

                {!isTeacher && selected.classId && (
                  <div className="flex items-start gap-3 py-3">
                    <Users size={15} className="mt-0.5 text-slate-400" />
                    <div>
                      <span className="block text-[11px] uppercase tracking-wide text-slate-400">
                        Lớp hỗ trợ
                      </span>
                      <strong className="text-xs font-medium text-slate-800">
                        {classes.find((item) => item.id === selected.classId)?.name ??
                          selected.classId}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="px-6 py-14 text-center text-sm text-slate-400">
              Chưa có lịch trong tuần này.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
