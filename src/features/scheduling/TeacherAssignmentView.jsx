import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { apiRequest, schedulingApi } from "../../services/api";
import { addDays, iso, mondayOf } from "./schedulingUtils";
import {
  buildWeekDays,
  formatWeekLabel,
  isInsideAvailability,
  normalizeAvailability,
  normalizeClass,
  normalizeEmployee,
  normalizeSchedule,
} from "./schedulingApiAdapters";

const fieldClass =
  "h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-[13px] text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

function StatusBadge({ children, tone = "slate" }) {
  const styles = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
  };
  return (
    <span className={"inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium " + styles[tone]}>
      {children}
    </span>
  );
}

export default function TeacherAssignmentView() {
  const [weekStart, setWeekStart] = useState(() => mondayOf());
  const [teachers, setTeachers] = useState([]);
  const [teacherAvailability, setTeacherAvailability] = useState([]);
  const [teachingSchedules, setTeachingSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [form, setForm] = useState({
    classId: "",
    date: iso(mondayOf()),
    startTime: "18:30",
    endTime: "20:30",
    campus: "Cơ sở chính",
  });
  const [message, setMessage] = useState(null);

  const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const [peopleRows, availabilityRows, scheduleRows, classRows] =
        await Promise.all([
          schedulingApi.employees("TEACHER"),
          schedulingApi.availability("TEACHER", iso(weekStart)),
          schedulingApi.teaching(iso(weekStart)),
          apiRequest("/classes").catch(() => []),
        ]);

      const nextTeachers = (Array.isArray(peopleRows) ? peopleRows : []).map(
        (row) => normalizeEmployee(row, "TEACHER"),
      );
      const nextAvailability = (
        Array.isArray(availabilityRows) ? availabilityRows : []
      ).map((row) => normalizeAvailability(row, "TEACHER"));
      const nextSchedules = (
        Array.isArray(scheduleRows) ? scheduleRows : []
      ).map((row) => normalizeSchedule(row, "TEACHER"));
      const nextClasses = (Array.isArray(classRows) ? classRows : []).map(
        normalizeClass,
      );

      setTeachers(nextTeachers);
      setTeacherAvailability(nextAvailability);
      setTeachingSchedules(nextSchedules);
      setClasses(nextClasses);
      setSelectedTeacherId((current) =>
        nextTeachers.some((teacher) => teacher.id === current)
          ? current
          : nextTeachers[0]?.id || "",
      );
      setForm((current) => ({
        ...current,
        classId:
          nextClasses.some((item) => item.id === current.classId)
            ? current.classId
            : nextClasses.find((item) =>
                ["READY", "RUNNING"].includes(item.status),
              )?.id || "",
        date: iso(weekStart),
      }));
    } catch (error) {
      setLoadError(error?.message || "Không thể tải dữ liệu phân công.");
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const assignableClasses = classes.filter((item) =>
    ["READY", "RUNNING"].includes(item.status),
  );

  const courses = useMemo(() => {
    const seen = new Set();
    return classes
      .filter((item) => item.courseId)
      .filter((item) => {
        if (seen.has(item.courseId)) return false;
        seen.add(item.courseId);
        return true;
      })
      .map((item) => ({
        id: item.courseId,
        name: item.courseName || item.courseId,
      }));
  }, [classes]);

  const visibleTeachers = useMemo(
    () =>
      teachers.filter((teacher) => {
        const matchTeacher =
          teacherFilter === "all" || teacher.id === teacherFilter;
        const matchSearch = (teacher.fullName + " " + teacher.teacherCode)
          .toLowerCase()
          .includes(search.toLowerCase());

        if (!matchTeacher || !matchSearch) return false;
        if (courseFilter === "all") return true;

        return teachingSchedules.some((schedule) => {
          if (schedule.teacherId !== teacher.id) return false;
          const classItem = classes.find((item) => item.id === schedule.classId);
          return classItem?.courseId === courseFilter;
        });
      }),
    [teacherFilter, courseFilter, search, teachingSchedules, classes],
  );

  const selectedTeacher = teachers.find(
    (teacher) => teacher.id === selectedTeacherId,
  );

  const selectedDay = weekDays.find((day) => day.date === form.date);
  const selectedAvailability = teacherAvailability.find(
    (availability) =>
      availability.teacherId === selectedTeacherId &&
      availability.day === selectedDay?.key &&
      isInsideAvailability(
        availability,
        form.startTime,
        form.endTime,
      ),
  );

  const selectedClass = assignableClasses.find(
    (item) => item.id === form.classId,
  );
  const selectedCourse = courses.find(
    (course) => course.id === selectedClass?.courseId,
  );

  const conflictingSchedule = teachingSchedules.find(
    (schedule) =>
      schedule.teacherId === selectedTeacherId &&
      schedule.date === form.date &&
      schedule.status === "ASSIGNED" &&
      form.startTime < schedule.endTime &&
      form.endTime > schedule.startTime,
  );

  function selectAvailability(teacherId, availability) {
    const day = weekDays.find((item) => item.key === availability.day);
    setSelectedTeacherId(teacherId);
    setForm((current) => ({
      ...current,
      date: day?.date ?? current.date,
      startTime: availability.startTime,
      endTime: availability.endTime,
      campus: availability.campus,
    }));
    setMessage(null);
  }

  async function submitAssignment() {
    setMessage(null);

    if (!selectedTeacherId || !form.classId) {
      setMessage({ type: "error", text: "Vui lòng chọn giáo viên và lớp." });
      return;
    }

    if (!selectedAvailability) {
      setMessage({
        type: "error",
        text: "Khung giờ đã chọn không nằm trọn trong lịch rảnh đã được duyệt của giáo viên.",
      });
      return;
    }

    if (conflictingSchedule) {
      setMessage({
        type: "error",
        text: "Giáo viên đã có lịch dạy trùng với khung giờ này.",
      });
      return;
    }

    try {
      await schedulingApi.assignTeacher({
        teacherId: selectedTeacherId,
        classId: form.classId,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        campus: form.campus,
      });

      setMessage({
        type: "success",
        text:
          "Đã phân công " +
          (selectedTeacher?.fullName || "giáo viên") +
          " cho " +
          (selectedClass?.classCode || "lớp đã chọn") +
          ".",
      });
      await loadData();
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message || "Không thể lưu phân công.",
      });
    }
  }

  return (
    <div className="space-y-4 font-sans text-[13px] leading-5 text-slate-800 antialiased">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck2 size={20} className="text-blue-600" />
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Lịch rảnh & Phân công giáo viên
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Xem lịch rảnh đã đăng ký, kiểm tra lịch dạy hiện tại và phân công giáo viên ngay trên cùng một màn hình.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center">
            <strong className="block text-base text-slate-900">{teachers.length}</strong>
            <span className="text-[11px] text-slate-500">Giáo viên</span>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center">
            <strong className="block text-base text-slate-900">{teacherAvailability.filter((item) => item.status === "APPROVED").length}</strong>
            <span className="text-[11px] text-slate-500">Slot rảnh</span>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center">
            <strong className="block text-base text-slate-900">{teachingSchedules.length}</strong>
            <span className="text-[11px] text-slate-500">Đã phân công</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center">
        <div className="flex h-9 min-w-52 flex-1 items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 text-slate-400 lg:max-w-72">
          <Search size={15} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm giáo viên..."
            className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-700 outline-none"
          />
        </div>
        <select
          className={fieldClass + " lg:w-52"}
          value={teacherFilter}
          onChange={(event) => setTeacherFilter(event.target.value)}
        >
          <option value="all">Tất cả giáo viên</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.fullName}
            </option>
          ))}
        </select>
        <select
          className={fieldClass + " lg:w-44"}
          value={courseFilter}
          onChange={(event) => setCourseFilter(event.target.value)}
        >
          <option value="all">Tất cả khóa học</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
        <div className="flex items-center rounded-md border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setWeekStart((current) => addDays(current, -7))}
            className="px-2.5 py-2 text-slate-400 hover:bg-slate-50"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="border-x border-slate-200 px-3 py-2 text-xs font-medium text-slate-700">
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
      </section>

      {(loading || loadError) && (
        <div
          className={
            "rounded-lg border px-4 py-3 text-sm " +
            (loadError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-slate-200 bg-white text-slate-500")
          }
        >
          {loadError || "Đang tải lịch giáo viên..."}
        </div>
      )}

      <div className="grid items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[190px_repeat(7,minmax(112px,1fr))] border-b border-slate-200 bg-slate-50">
                <div className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Giáo viên
                </div>
                {weekDays.map((day) => (
                  <div key={day.key} className="border-l border-slate-200 px-2 py-2 text-center">
                    <strong className="block text-xs text-slate-700">{day.label}</strong>
                    <span className="text-[11px] text-slate-400">{day.displayDate}</span>
                  </div>
                ))}
              </div>

              {visibleTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="grid min-h-32 grid-cols-[190px_repeat(7,minmax(112px,1fr))] border-b border-slate-200 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedTeacherId(teacher.id)}
                    className={
                      "px-3 py-4 text-left transition " +
                      (selectedTeacherId === teacher.id
                        ? "bg-blue-50"
                        : "bg-slate-50 hover:bg-slate-100")
                    }
                  >
                    <span className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#173557] text-xs font-semibold text-white">
                      {teacher.fullName
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <strong className="block text-xs font-semibold text-slate-900">
                      {teacher.fullName}
                    </strong>
                    <span className="text-[11px] text-slate-400">
                      {teacher.teacherCode}
                    </span>
                  </button>

                  {weekDays.map((day) => {
                    const availabilities = teacherAvailability.filter(
                      (item) =>
                        item.teacherId === teacher.id && item.day === day.key,
                    );
                    const schedules = teachingSchedules.filter(
                      (schedule) =>
                        schedule.teacherId === teacher.id &&
                        schedule.date === day.date &&
                        schedule.status === "ASSIGNED",
                    );

                    return (
                      <div key={day.key} className="space-y-1.5 border-l border-slate-200 p-2">
                        {availabilities.map((availability) => (
                          <button
                            key={availability.id}
                            type="button"
                            onClick={() =>
                              selectAvailability(teacher.id, availability)
                            }
                            className={
                              "w-full rounded-md border px-2 py-1.5 text-left transition " +
                              (availability.status === "APPROVED"
                                ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                                : "border-amber-200 bg-amber-50 hover:bg-amber-100")
                            }
                          >
                            <span className="block text-[11px] font-semibold text-slate-700">
                              {availability.startTime}–{availability.endTime}
                            </span>
                            <span className="block text-[10px] text-slate-500">
                              {availability.status === "APPROVED"
                                ? "Rảnh"
                                : "Chờ duyệt"}
                            </span>
                          </button>
                        ))}

                        {schedules.map((schedule) => {
                          const classItem = classes.find(
                            (item) => item.id === schedule.classId,
                          );
                          return (
                            <div
                              key={schedule.id}
                              className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1.5"
                            >
                              <span className="block text-[10px] font-semibold uppercase text-blue-700">
                                Đã xếp lớp
                              </span>
                              <span className="block text-[11px] font-medium text-slate-700">
                                {schedule.startTime}–{schedule.endTime}
                              </span>
                              <span className="block truncate text-[10px] text-slate-500">
                                {classItem?.classCode}
                              </span>
                            </div>
                          );
                        })}

                        {!availabilities.length && !schedules.length && (
                          <div className="pt-8 text-center text-slate-300">—</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {!visibleTeachers.length && (
                <div className="px-6 py-12 text-center text-sm text-slate-400">
                  Không có giáo viên phù hợp bộ lọc.
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Lịch rảnh đã duyệt</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Chờ duyệt</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Đã phân công</span>
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
            <UserCheck size={17} className="text-blue-600" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Phân công giáo viên
            </h3>
          </div>

          <div className="space-y-4 p-4">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <span className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">
                Giáo viên đã chọn
              </span>
              <div className="flex items-center justify-between gap-2">
                <strong className="text-sm text-slate-900">
                  {selectedTeacher?.fullName || "Chưa chọn"}
                </strong>
                {selectedTeacher && <StatusBadge tone="blue">{selectedTeacher.teacherCode}</StatusBadge>}
              </div>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">
                Lớp cần phân công
              </span>
              <select
                className={fieldClass}
                value={form.classId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, classId: event.target.value }))
                }
              >
                {assignableClasses.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.classCode} · {classItem.name}
                  </option>
                ))}
              </select>
              {selectedCourse && (
                <span className="mt-1 block text-[11px] text-slate-400">
                  Khóa học: {selectedCourse.name}
                </span>
              )}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">
                Ngày dạy
              </span>
              <select
                className={fieldClass}
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, date: event.target.value }))
                }
              >
                {weekDays.map((day) => (
                  <option key={day.date} value={day.date}>
                    {day.label} · {day.displayDate}/2026
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1.5 block text-xs font-medium text-slate-600">
                  Bắt đầu
                </span>
                <input
                  type="time"
                  className={fieldClass}
                  value={form.startTime}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      startTime: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span className="mb-1.5 block text-xs font-medium text-slate-600">
                  Kết thúc
                </span>
                <input
                  type="time"
                  className={fieldClass}
                  value={form.endTime}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      endTime: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">
                Cơ sở
              </span>
              <select
                className={fieldClass}
                value={form.campus}
                onChange={(event) =>
                  setForm((current) => ({ ...current, campus: event.target.value }))
                }
              >
                <option>Cơ sở chính</option>
                <option>Cơ sở Quận 1</option>
                <option>Cơ sở Quận 3</option>
              </select>
            </label>

            <div className="space-y-2 rounded-md border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock3 size={14} />
                  Kiểm tra lịch rảnh
                </span>
                {selectedAvailability ? (
                  <StatusBadge tone="emerald">Phù hợp</StatusBadge>
                ) : (
                  <StatusBadge tone="amber">Ngoài lịch rảnh</StatusBadge>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Users size={14} />
                  Trùng lịch dạy
                </span>
                {conflictingSchedule ? (
                  <StatusBadge tone="amber">Có xung đột</StatusBadge>
                ) : (
                  <StatusBadge tone="emerald">Không xung đột</StatusBadge>
                )}
              </div>
            </div>

            {message && (
              <div
                className={
                  "rounded-md border px-3 py-2 text-xs " +
                  (message.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700")
                }
              >
                {message.type === "success" && (
                  <CheckCircle2 size={14} className="mr-1 inline" />
                )}
                {message.text}
              </div>
            )}

            <Button
              variant="primary"
              className="w-full"
              onClick={submitAssignment}
              disabled={!selectedTeacherId || !form.classId}
            >
              <UserCheck size={16} />
              Xác nhận phân công
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
