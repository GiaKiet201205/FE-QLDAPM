import { addDays, days, iso } from "./schedulingUtils";

const DAY_ALIASES = {
  mon: "mon",
  monday: "mon",
  tue: "tue",
  tues: "tue",
  tuesday: "tue",
  wed: "wed",
  wednesday: "wed",
  thu: "thu",
  thur: "thu",
  thurs: "thu",
  thursday: "thu",
  fri: "fri",
  friday: "fri",
  sat: "sat",
  saturday: "sat",
  sun: "sun",
  sunday: "sun",
};

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function hhmm(value) {
  return String(value || "").slice(0, 5);
}

function shiftFromTime(startTime) {
  const start = hhmm(startTime);
  if (start < "12:00") return "morning";
  if (start < "18:00") return "afternoon";
  return "evening";
}

export function normalizeDay(value, date) {
  const key = String(value || "").trim().toLowerCase();
  if (DAY_ALIASES[key]) return DAY_ALIASES[key];

  if (date) {
    const parsed = new Date(String(date).slice(0, 10) + "T00:00:00");
    if (!Number.isNaN(parsed.getTime())) {
      const index = (parsed.getDay() + 6) % 7;
      return days[index];
    }
  }

  return "";
}

export function buildWeekDays(weekStart) {
  return days.map((key, index) => {
    const date = addDays(weekStart, index);
    return {
      key,
      label: DAY_LABELS[index],
      date: iso(date),
      displayDate: String(date.getDate()).padStart(2, "0") + "/" +
        String(date.getMonth() + 1).padStart(2, "0"),
    };
  });
}

export function formatWeekLabel(weekStart) {
  const end = addDays(weekStart, 6);
  const startText =
    String(weekStart.getDate()).padStart(2, "0") +
    "/" +
    String(weekStart.getMonth() + 1).padStart(2, "0");
  const endText =
    String(end.getDate()).padStart(2, "0") +
    "/" +
    String(end.getMonth() + 1).padStart(2, "0") +
    "/" +
    end.getFullYear();

  return startText + " – " + endText;
}

export function normalizeEmployee(row, role) {
  const id =
    row?.id ??
    row?.employeeId ??
    row?.userId ??
    row?.teacherId ??
    row?.accountId;

  return {
    ...row,
    id: String(id ?? ""),
    fullName:
      row?.fullName ??
      row?.name ??
      row?.displayName ??
      row?.username ??
      "Chưa cập nhật",
    employeeCode:
      row?.employeeCode ??
      row?.staffCode ??
      row?.teacherCode ??
      row?.code ??
      String(id ?? ""),
    teacherCode:
      row?.teacherCode ??
      row?.employeeCode ??
      row?.staffCode ??
      row?.code ??
      String(id ?? ""),
    role,
  };
}

export function normalizeAvailability(row, role) {
  const date = row?.availableDate ?? row?.date ?? "";
  const employeeId =
    row?.employeeId ??
    row?.userId ??
    row?.teacherId ??
    row?.accountId ??
    row?.ownerId;

  const startTime = hhmm(row?.startTime ?? row?.start);
  const endTime = hhmm(row?.endTime ?? row?.end);
  const status = String(row?.status ?? "PENDING").toUpperCase();

  return {
    ...row,
    id: String(row?.id ?? row?.availabilityId ?? ""),
    employeeId: String(employeeId ?? ""),
    teacherId: String(row?.teacherId ?? employeeId ?? ""),
    userId: String(row?.userId ?? employeeId ?? ""),
    staffRole: row?.staffRole ?? role,
    day: normalizeDay(row?.day ?? row?.dayOfWeek, date),
    shift: row?.shift ?? shiftFromTime(startTime),
    startTime,
    endTime,
    start: startTime,
    end: endTime,
    status,
    availableDate: date ? String(date).slice(0, 10) : "",
    availabilityType: row?.availabilityType ?? row?.type ?? "RECURRING",
    campus: row?.campus ?? row?.workplaceName ?? row?.location ?? "Cơ sở chính",
    workplaceId: row?.workplaceId ?? "center-01",
    note: row?.note ?? "",
    createdAt: row?.createdAt ?? row?.submittedAt ?? "",
    reviewedAt: row?.reviewedAt ?? "",
  };
}

export function normalizeSchedule(row, role) {
  const employeeId =
    row?.employeeId ??
    row?.userId ??
    row?.teacherId ??
    row?.accountId;

  return {
    ...row,
    id: String(row?.id ?? row?.scheduleId ?? ""),
    employeeId: String(employeeId ?? ""),
    teacherId: String(row?.teacherId ?? employeeId ?? ""),
    userId: String(row?.userId ?? employeeId ?? ""),
    staffRole: row?.staffRole ?? role,
    classId: row?.classId != null ? String(row.classId) : null,
    date: String(row?.date ?? row?.scheduleDate ?? "").slice(0, 10),
    startTime: hhmm(row?.startTime ?? row?.start),
    endTime: hhmm(row?.endTime ?? row?.end),
    status: String(row?.status ?? "ASSIGNED").toUpperCase(),
    campus: row?.campus ?? row?.workplaceName ?? row?.location ?? "",
    workplaceId: row?.workplaceId ?? "",
    workType: row?.workType ?? "",
  };
}

export function normalizeClass(row) {
  const id = row?.id ?? row?.classId;
  return {
    ...row,
    id: String(id ?? ""),
    classId: String(id ?? ""),
    classCode: row?.classCode ?? row?.code ?? String(id ?? ""),
    name: row?.name ?? row?.className ?? row?.classCode ?? "Lớp học",
    courseId: String(row?.courseId ?? row?.course?.id ?? ""),
    courseName: row?.courseName ?? row?.course?.name ?? "",
    status: String(row?.status ?? "READY").toUpperCase(),
  };
}

export function isInsideAvailability(availability, startTime, endTime) {
  return (
    availability?.status === "APPROVED" &&
    startTime >= availability.startTime &&
    endTime <= availability.endTime
  );
}

export function availabilityTypeToUi(value) {
  const normalized = String(value || "").toUpperCase();
  return normalized === "WEEKLY" ? "Lịch rảnh theo tuần" : "Lịch rảnh định kỳ";
}

export function availabilityTypeToApi(value) {
  return String(value || "").toLowerCase().includes("tuần") ? "WEEKLY" : "RECURRING";
}

export function availabilityStatusToUi(value) {
  const normalized = String(value || "").toUpperCase();
  if (normalized === "APPROVED" || normalized === "VERIFIED") return "verified";
  if (normalized === "REJECTED") return "rejected";
  return "pending";
}
