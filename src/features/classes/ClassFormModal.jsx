import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp, AlertTriangle, Plus, Trash2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { courses as fallbackCourses } from "./mockClasses";
import { getCourseTargetDefinition } from "../academic/targetEligibility";

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
  const [selectedDays, setSelectedDays] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState("weekly");
  const [unapplied, setUnapplied] = useState(false);
  const [confirmedUnapplied, setConfirmedUnapplied] = useState(false);
  const [showAll, setShowAll] = useState(false);
  function markDraftChanged() { setUnapplied(true); setConfirmedUnapplied(false); }
  const [sessionFrom, setSessionFrom] = useState("18:00");
  const [sessionTo, setSessionTo] = useState("20:00");
  const [oneOffDate, setOneOffDate] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const [customTargetType, setCustomTargetType] = useState(
    () => Object.keys(classItem?.requiredTargets?.[classItem.courseId] ?? {})[0] || "OVERALL_SCORE",
  );
  const weekdayOptions = [
    [1, "T2"], [2, "T3"], [3, "T4"], [4, "T5"],
    [5, "T6"], [6, "T7"], [0, "CN"],
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
      if (!selectedDays.length) { setSubmitError("Vui lòng chọn ít nhất một thứ."); return; }
      const start = new Date(form.startDate + "T12:00:00");
      const end = new Date(form.endDate + "T12:00:00");
      for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        if (selectedDays.includes(date.getDay())) {
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
    // A repeated click on the same weekday must not duplicate already-added lessons.
    const keyed = new Map(
      [...plannedSessions, ...items].map((slot) => [
        [slot.date, slot.startTime, slot.endTime].join("|"), slot,
      ]),
    );
    const combined = [...keyed.values()].sort(
      (left, right) =>
        (left.date + left.startTime).localeCompare(right.date + right.startTime),
    );
    if (combined.length > 400) {
      setSubmitError("Mỗi lớp được lập tối đa 400 buổi; hãy giảm ngày học hoặc khoảng ngày.");
      return;
    }
    for (let i = 1; i < combined.length; i += 1) {
      const previous = combined[i - 1];
      const current = combined[i];
      if (
        previous.date === current.date &&
        previous.startTime < current.endTime &&
        previous.endTime > current.startTime
      ) {
        setSubmitError("Lịch học có hai khung giờ chồng lên nhau trong cùng một ngày.");
        return;
      }
    }
    appendSessions(items);
    setUnapplied(false);
    setShowAll(false);
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

  const missingRequiredTarget = definition
    ? definition.targets.some((target) =>
        form.requiredTargets?.[form.courseId]?.[target.type] === "" ||
        form.requiredTargets?.[form.courseId]?.[target.type] == null)
    : !customTargetType.trim() ||
      form.requiredTargets?.[form.courseId]?.[customTargetType] === "" ||
      form.requiredTargets?.[form.courseId]?.[customTargetType] == null;

  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function updateCustomTargetType(value) {
    const next = value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
    setForm((current) => {
      const previous = current.requiredTargets?.[current.courseId] ?? {};
      const amount = previous[customTargetType] ?? "";
      const updated = { ...previous };
      delete updated[customTargetType];
      if (next) updated[next] = amount;
      return {
        ...current,
        requiredTargets: { ...(current.requiredTargets ?? {}), [current.courseId]: updated },
      };
    });
    setCustomTargetType(next);
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
    if (!isEditing && unapplied && !confirmedUnapplied) {
      setExpanded(true);
      setConfirmedUnapplied(true);
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
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-medium">Mã tiêu chí tùy chỉnh
                <input className={inputClass} value={customTargetType} required
                  onChange={(event) => updateCustomTargetType(event.target.value)}
                  placeholder="OVERALL_SCORE" />
              </label>
              <label className="grid gap-1 text-xs font-medium">Mức mục tiêu tối thiểu
                <input className={inputClass} type="number" min="0" step="any" required
                  value={form.requiredTargets?.[form.courseId]?.[customTargetType] ?? ""}
                  onChange={(event) => updateRequiredTarget(customTargetType, event.target.value)} />
              </label>
              <p className="text-xs text-slate-500 sm:col-span-2">
                Khóa học này không có thang điểm cố định. Tên tiêu chí và mức mục tiêu
                được lưu cùng lớp để so sánh với target học viên.
              </p>
            </div>
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
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <button type="button" aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50">
              <span className="flex items-center gap-2">
                <CalendarDays size={19} className="text-[#173557]" />
                <span>
                  <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    Lịch học dự kiến <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">Tùy chọn</span>
                    {plannedSessions.length > 0 && <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">{plannedSessions.length} buổi đã thêm</span>}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">Chọn thứ, giờ học và xem trước lịch; có thể bổ sung sau khi tạo DRAFT.</span>
                </span>
              </span>
              {expanded ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}
            </button>
            {expanded && <div className="space-y-3 border-t border-slate-100 p-4">
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                {[["weekly","Lặp hằng tuần"],["single","Buổi riêng"]].map(([key,label])=>(
                  <button key={key} type="button" aria-pressed={mode===key}
                    onClick={()=>{setMode(key);setConfirmedUnapplied(false);}}
                    className={`rounded-md px-3 py-2 text-xs font-semibold ${mode===key?"bg-white text-[#173557] shadow-sm":"text-slate-500"}`}>{label}</button>
                ))}
              </div>
              {mode==="weekly" ? <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700">Chọn các ngày trong tuần</p>
                <div className="grid grid-cols-7 gap-1.5">
                  {weekdayOptions.map(([day,label])=>(
                    <button key={day} type="button" aria-pressed={selectedDays.includes(day)}
                      onClick={()=>{setSelectedDays((v)=>v.includes(day)?v.filter((x)=>x!==day):[...v,day]);markDraftChanged();}}
                      className={`h-10 rounded-lg border text-xs font-semibold ${selectedDays.includes(day)?"border-[#173557] bg-[#173557] text-white":"border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">Áp dụng các thứ đã chọn từ ngày bắt đầu đến ngày kết thúc.</p>
              </div> : <label className="grid gap-1 text-xs font-medium">Ngày của buổi riêng
                <input className={inputClass} type="date" min={form.startDate||undefined} max={form.endDate||undefined}
                  value={oneOffDate} onChange={(e)=>{setOneOffDate(e.target.value);markDraftChanged();}}/>
              </label>}
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-xs font-medium">Giờ bắt đầu
                  <input className={inputClass} type="time" value={sessionFrom}
                    onChange={(e)=>{setSessionFrom(e.target.value);markDraftChanged();}}/>
                </label>
                <label className="grid gap-1 text-xs font-medium">Giờ kết thúc
                  <input className={inputClass} type="time" value={sessionTo}
                    onChange={(e)=>{setSessionTo(e.target.value);markDraftChanged();}}/>
                </label>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-blue-50 p-3">
                <span className="text-xs font-medium text-[#173557]">
                  {mode==="weekly"
                    ? (selectedDays.length && form.startDate && form.endDate && !invalidDateRange
                      ? (()=>{let count=0;const d=new Date(form.startDate+"T12:00:00"),last=new Date(form.endDate+"T12:00:00");for(;d<=last&&count<=400;d.setDate(d.getDate()+1))if(selectedDays.includes(d.getDay()))count++;return count>400?"Trên 400 buổi":count+" buổi dự kiến · "+sessionFrom+"–"+sessionTo;})()
                      : "Chọn thứ và khoảng ngày để xem số buổi")
                    : (oneOffDate ? oneOffDate+" · "+sessionFrom+"–"+sessionTo : "Chọn ngày của buổi riêng")}
                </span>
                <button type="button" onClick={()=>addPlannedSessions(mode==="weekly")}
                  className="inline-flex items-center gap-1 rounded-md bg-[#173557] px-3 py-2 text-xs font-semibold text-white hover:bg-[#24486f]">
                  <Plus size={15}/> Thêm vào lịch
                </button>
              </div>
              {unapplied && <p role="status" className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <AlertTriangle size={16} className="shrink-0" /> Ngày/giờ vừa thay đổi chưa được thêm vào lịch. Bấm “Thêm vào lịch” để lưu các buổi đó.
              </p>}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between gap-2 text-xs font-semibold">
                  <span>Buổi đã thêm ({plannedSessions.length})</span>
                  {plannedSessions.length>0 && <button type="button" className="text-red-600" onClick={()=>{setPlannedSessions([]);setShowAll(false);}}>Xóa tất cả</button>}
                </div>
                {!plannedSessions.length && <p className="rounded-md border border-dashed border-slate-200 p-3 text-xs text-slate-500">Chưa có buổi nào. Bạn vẫn có thể tạo DRAFT và thêm lịch sau.</p>}
                <div className="max-h-52 space-y-1 overflow-y-auto">
                  {(showAll?plannedSessions:plannedSessions.slice(0,6)).map((slot)=>(
                    <div key={slot.date+"|"+slot.startTime+"|"+slot.endTime} className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs">
                      <span>{slot.date} · {slot.startTime}–{slot.endTime}</span>
                      <button type="button" title="Bỏ buổi" onClick={()=>setPlannedSessions((v)=>v.filter((item)=>item!==slot))} className="text-red-600"><Trash2 size={15}/></button>
                    </div>
                  ))}
                </div>
                {plannedSessions.length>6 && <button type="button" className="text-xs text-[#173557] underline" onClick={()=>setShowAll((v)=>!v)}>{showAll?"Thu gọn":"Xem tất cả "+plannedSessions.length+" buổi"}</button>}
              </div>
            </div>}
          </section>
        )}
        {!isEditing && confirmedUnapplied && unapplied && (
          <div role="alert" className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-900">Bạn đã thay đổi lịch nhưng chưa bấm “Thêm vào lịch”.</p>
            <p className="text-xs text-amber-800">Chỉ {plannedSessions.length} buổi đã thêm sẽ được lưu; lựa chọn mới không được lưu.</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={()=>setConfirmedUnapplied(false)}>Quay lại thêm buổi</Button>
              <Button type="button" variant="primary" disabled={saving} onClick={()=>{setUnapplied(false);setConfirmedUnapplied(false);}}>
                Xác nhận bỏ thay đổi chưa thêm
              </Button>
            </div>
          </div>
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
