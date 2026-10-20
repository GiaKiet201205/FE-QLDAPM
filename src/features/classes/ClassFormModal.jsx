import { useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { courses as fallbackCourses } from "./mockClasses";
import {
  courseTargetDefinitions,
  getCourseTargetDefinition,
} from "../academic/targetEligibility";

const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[13px] font-normal text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function ClassFormModal({
  classItem,
  emptyForm,
  courseOptions = fallbackCourses,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(
    classItem
      ? {
          ...classItem,
          requiredTargets: classItem.requiredTargets ?? {},
        }
      : { ...emptyForm, status: "DRAFT" },
  );
  const isEditing = Boolean(classItem);
  const [plannedSessions, setPlannedSessions] = useState([]);
  const [sessionDay, setSessionDay] = useState("1");
  const [sessionFrom, setSessionFrom] = useState("18:00");
  const [sessionTo, setSessionTo] = useState("20:00");
  const [oneOffDate, setOneOffDate] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const weekdayOptions = [
    ["1", "Thứ 2"], ["2", "Thứ 3"], ["3", "Thứ 4"], ["4", "Thứ 5"],
    ["5", "Thứ 6"], ["6", "Thứ 7"], ["0", "Chủ nhật"],
  ];

  function appendSessions(items) {
    setSubmitError("");
    setPlannedSessions((current) => {
      const unique = new Map(current.map((slot) => [
        slot.date + "|" + slot.startTime + "|" + slot.endTime, slot,
      ]));
      for (const slot of items) {
        unique.set(slot.date + "|" + slot.startTime + "|" + slot.endTime, slot);
      }
      return [...unique.values()].sort((a, b) =>
        (a.date + a.startTime).localeCompare(b.date + b.startTime));
    });
  }

  function addPlannedSessions(weekly) {
    if (!form.startDate || !form.endDate || invalidDateRange) {
      setSubmitError("Hãy chọn ngày bắt đầu và kết thúc lớp hợp lệ trước.");
      return;
    }
    if (!sessionFrom || !sessionTo || sessionFrom >= sessionTo) {
      setSubmitError("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }
    const items = [];
    if (weekly) {
      const start = new Date(form.startDate + "T12:00:00");
      const end = new Date(form.endDate + "T12:00:00");
      for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        if (date.getDay() === Number(sessionDay)) {
          const iso = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")].join("-");
          items.push({ date: iso, startTime: sessionFrom, endTime: sessionTo });
        }
        if (items.length > 400) break;
      }
    } else {
      if (!oneOffDate || oneOffDate < form.startDate || oneOffDate > form.endDate) {
        setSubmitError("Ngày học lẻ phải nằm trong khoảng ngày của lớp.");
        return;
      }
      items.push({ date: oneOffDate, startTime: sessionFrom, endTime: sessionTo });
    }
    const combined = [...plannedSessions, ...items];
    if (combined.length > 400) {
      setSubmitError("Mỗi lớp được lập tối đa 400 buổi; hãy giảm khoảng ngày.");
      return;
    }
    for (const slot of items) {
      const overlapping = combined.some((other) =>
        other !== slot && other.date === slot.date &&
        slot.startTime < other.endTime && slot.endTime > other.startTime &&
        !(slot.startTime === other.startTime && slot.endTime === other.endTime));
      if (overlapping) {
        setSubmitError("Lịch học có hai khung giờ chồng lên nhau trong cùng một ngày.");
        return;
      }
    }
    appendSessions(items);
  }

  const definition = getCourseTargetDefinition(form.courseId);

  const invalidDateRange = useMemo(
    () =>
      Boolean(
        form.startDate &&
          form.endDate &&
          new Date(form.startDate) > new Date(form.endDate),
      ),
    [form.startDate, form.endDate],
  );

  const missingRequiredTarget =
    !definition ||
    definition.targets.some(
      (target) =>
        form.requiredTargets?.[form.courseId]?.[target.type] === "" ||
        form.requiredTargets?.[form.courseId]?.[target.type] == null,
    );

  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function updateRequiredTarget(targetType, value) {
    setForm((current) => ({
      ...current,
      requiredTargets: {
        ...(current.requiredTargets ?? {}),
        [current.courseId]: {
          ...(current.requiredTargets?.[current.courseId] ?? {}),
          [targetType]: value,
        },
      },
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitError("");
    if (invalidDateRange || missingRequiredTarget || saving) return;
    if (!isEditing && plannedSessions.some((slot) =>
      slot.date < form.startDate || slot.date > form.endDate
    )) {
      setSubmitError("Có buổi học nằm ngoài ngày bắt đầu/kết thúc lớp.");
      return;
    }
    setSaving(true);
    try {
      const result = await onSave({
        ...form,
        status: isEditing ? classItem.status : "DRAFT",
        ...(!isEditing ? { plannedSessions } : {}),
      });
      if (result === false) setSubmitError("Không thể lưu lớp. Kiểm tra lỗi API và thử lại.");
    } catch (error) {
      setSubmitError(error?.message || "Không thể lưu lớp.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEditing ? "Edit Class" : "Create Class"}
      onClose={onClose}
      maxWidth="max-w-xl"
    >
      <form onSubmit={submit} className="grid gap-3.5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-[13px] font-medium">
            Class code
            <input
              className={inputClass}
              name="classCode"
              value={form.classCode}
              onChange={update}
              required
              autoFocus
              placeholder="IELTS-M75-04"
            />
          </label>

          <label className="grid gap-1.5 text-[13px] font-medium">
            Course
            <select
              className={inputClass}
              name="courseId"
              value={form.courseId}
              onChange={update}
            >
              {courseOptions.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-1.5 text-[13px] font-medium">
          Class name
          <input
            className={inputClass}
            name="name"
            value={form.name}
            onChange={update}
            required
            placeholder="IELTS Mastery 7.5"
          />
        </label>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2">
            <strong className="block text-[13px] font-medium text-slate-800">
              Required {definition?.courseLabel ?? "course"} target
            </strong>
            <span className="text-xs leading-5 text-slate-500">
              A student must have a target for this same course and meet every
              required threshold before being added to the class.
              {definition?.scaleNote ? ` ${definition.scaleNote}.` : ""}
            </span>
          </div>

          {definition ? (
            <div
              className={`grid gap-3 ${
                definition.targets.length > 1 ? "sm:grid-cols-2" : ""
              }`}
            >
              {definition.targets.map((target) => (
                <label
                  key={target.type}
                  className="grid gap-1.5 text-[13px] font-medium"
                >
                  {target.label}
                  <input
                    className={inputClass}
                    type="number"
                    min={target.min}
                    max={target.max}
                    step={target.step}
                    value={
                      form.requiredTargets?.[form.courseId]?.[target.type] ?? ""
                    }
                    onChange={(event) =>
                      updateRequiredTarget(target.type, event.target.value)
                    }
                    required
                    placeholder={`${target.min}–${target.max}`}
                  />
                </label>
              ))}
            </div>
          ) : (
            <p className="text-xs text-red-600">
              No target model is configured for this course.
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-[13px] font-medium">
            Start date
            <input
              className={inputClass}
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={update}
              required
            />
          </label>

          <label className="grid gap-1.5 text-[13px] font-medium">
            End date
            <input
              className={inputClass}
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={update}
              required
            />
          </label>
        </div>

        {invalidDateRange && (
          <p className="text-xs text-red-600">
            End date must be on or after start date.
          </p>
        )}
        {!isEditing && (
          <section className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <div>
              <strong className="text-sm font-semibold">Lịch học dự kiến (không bắt buộc khi tạo DRAFT)</strong>
              <p className="text-xs text-slate-500">Admin/CS chọn giờ học trước; TC phân công giáo viên sau. Có thể bổ sung lịch tại tab Schedule trước khi chuyển READY.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs">Bắt đầu
                <input className={inputClass} type="time" value={sessionFrom} onChange={(e) => setSessionFrom(e.target.value)} />
              </label>
              <label className="text-xs">Kết thúc
                <input className={inputClass} type="time" value={sessionTo} onChange={(e) => setSessionTo(e.target.value)} />
              </label>
              <label className="text-xs">Thứ hằng tuần
                <select className={inputClass} value={sessionDay} onChange={(e) => setSessionDay(e.target.value)}>
                  {weekdayOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <div className="flex items-end">
                <Button type="button" onClick={() => addPlannedSessions(true)}>Thêm lịch hằng tuần</Button>
              </div>
              <label className="text-xs">Buổi lẻ
                <input className={inputClass} type="date" min={form.startDate || undefined}
                  max={form.endDate || undefined} value={oneOffDate}
                  onChange={(e) => setOneOffDate(e.target.value)} />
              </label>
              <div className="flex items-end">
                <Button type="button" onClick={() => addPlannedSessions(false)}>Thêm buổi lẻ</Button>
              </div>
            </div>
            <div className="max-h-32 space-y-1 overflow-auto">
              {plannedSessions.map((slot) => (
                <div key={slot.date + slot.startTime + slot.endTime} className="flex items-center justify-between rounded bg-white px-2 py-1 text-xs">
                  <span>{slot.date} · {slot.startTime}–{slot.endTime}</span>
                  <button type="button" className="text-red-600" onClick={() =>
                    setPlannedSessions((current) => current.filter((item) => item !== slot))
                  }>Bỏ</button>
                </div>
              ))}
              {!plannedSessions.length && <p className="text-xs text-slate-500">Chưa chọn buổi nào: lớp vẫn có thể được lưu DRAFT.</p>}
            </div>
            <p className="text-xs text-slate-500">{plannedSessions.length} buổi dự kiến</p>
          </section>
        )}
        {submitError && <p role="alert" className="text-xs text-red-700">{submitError}</p>}

        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
          Status is managed by the class workflow. New classes start as
          <strong className="ml-1 text-slate-700">Draft</strong>.
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={invalidDateRange || missingRequiredTarget || saving}
          >
            {saving ? "Đang lưu..." : isEditing ? "Save Changes" : "Create Class"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
