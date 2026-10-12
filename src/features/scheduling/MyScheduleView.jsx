import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { useAcademicData } from "../academic/AcademicDataContext";
import { demoTeacherId } from "../academic/mockAcademicRelations";
import { csUsers, saleUsers } from "../classes/mockClassOperations";
import { csWorkTypes, saleWorkTypes, workplaceOptions } from "./mockStaffAssignment";

const weekDays = [
  { key: "mon", label: "T2", date: "2026-10-12", display: "12/10" },
  { key: "tue", label: "T3", date: "2026-10-13", display: "13/10" },
  { key: "wed", label: "T4", date: "2026-10-14", display: "14/10" },
  { key: "thu", label: "T5", date: "2026-10-15", display: "15/10" },
  { key: "fri", label: "T6", date: "2026-10-16", display: "16/10" },
  { key: "sat", label: "T7", date: "2026-10-17", display: "17/10" },
  { key: "sun", label: "CN", date: "2026-10-18", display: "18/10" },
];

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
  return source.find((item) => item.value === value)?.label ?? value;
}

export default function MyScheduleView({ roleKey }) {
  const { teachingSchedules, staffSchedules, classes } = useAcademicData();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");

  const isTeacher = roleKey === "TEACHER";
  const currentUserId = isTeacher
    ? demoTeacherId
    : roleKey === "CS"
      ? csUsers[0].id
      : saleUsers[0].id;

  const schedules = useMemo(() => {
    const source = isTeacher
      ? teachingSchedules
          .filter(
            (item) =>
              item.teacherId === currentUserId &&
              item.status === "ASSIGNED" &&
              item.date >= "2026-10-12" &&
              item.date <= "2026-10-18",
          )
          .map((item) => {
            const classItem = classes.find((cls) => cls.id === item.classId);
            return {
              ...item,
              title: classItem?.name ?? "Lớp học",
              subtitle: classItem?.classCode ?? "",
              place: item.room ?? item.campus ?? "Cơ sở chính",
              kind: "TEACHING",
            };
          })
      : staffSchedules
          .filter(
            (item) =>
              item.userId === currentUserId &&
              item.staffRole === roleKey &&
              item.status === "ASSIGNED" &&
              item.date >= "2026-10-12" &&
              item.date <= "2026-10-18",
          )
          .map((item) => {
            const classItem = item.classId
              ? classes.find((cls) => cls.id === item.classId)
              : null;
            const workplace =
              workplaceOptions.find((place) => place.id === item.workplaceId)
                ?.label ?? item.workplaceId;
            return {
              ...item,
              title: getWorkTypeLabel(roleKey, item.workType),
              subtitle: classItem?.classCode ?? (roleKey === "CS" ? "CS" : "Sale"),
              place: workplace,
              kind: "WORK",
            };
          });

    return source.filter((item) =>
      (item.title + " " + item.subtitle + " " + item.place)
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [
    isTeacher,
    teachingSchedules,
    staffSchedules,
    currentUserId,
    classes,
    roleKey,
    search,
  ]);

  const selected = schedules.find((item) => item.id === selectedId) ?? schedules[0] ?? null;

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
              <button type="button" className="px-2.5 py-2 text-slate-400 hover:bg-slate-50">
                <ChevronLeft size={15} />
              </button>
              <span className="border-x border-slate-200 px-4 py-2 text-xs font-medium text-slate-700">
                Tuần 42 · 12/10 – 18/10/2026
              </span>
              <button type="button" className="px-2.5 py-2 text-slate-400 hover:bg-slate-50">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

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
                    <span className="text-[11px] text-slate-400">{day.display}</span>
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
                        {classes.find((item) => item.id === selected.classId)?.name ?? selected.classId}
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
