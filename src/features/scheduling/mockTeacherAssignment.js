export const teacherAvailability = [
  { id: "av-001", teacherId: "teacher-001", day: "mon", startTime: "18:00", endTime: "21:00", campus: "Cơ sở chính", status: "APPROVED" },
  { id: "av-002", teacherId: "teacher-001", day: "tue", startTime: "14:00", endTime: "17:00", campus: "Cơ sở chính", status: "APPROVED" },
  { id: "av-003", teacherId: "teacher-001", day: "wed", startTime: "18:00", endTime: "21:00", campus: "Cơ sở chính", status: "APPROVED" },
  { id: "av-004", teacherId: "teacher-001", day: "thu", startTime: "18:00", endTime: "21:00", campus: "Cơ sở chính", status: "APPROVED" },
  { id: "av-005", teacherId: "teacher-001", day: "sat", startTime: "08:30", endTime: "11:30", campus: "Cơ sở chính", status: "APPROVED" },

  { id: "av-006", teacherId: "teacher-002", day: "mon", startTime: "08:30", endTime: "11:30", campus: "Cơ sở Quận 1", status: "APPROVED" },
  { id: "av-007", teacherId: "teacher-002", day: "tue", startTime: "18:00", endTime: "21:00", campus: "Cơ sở Quận 1", status: "APPROVED" },
  { id: "av-008", teacherId: "teacher-002", day: "thu", startTime: "14:00", endTime: "17:00", campus: "Cơ sở Quận 1", status: "APPROVED" },
  { id: "av-009", teacherId: "teacher-002", day: "fri", startTime: "18:00", endTime: "21:00", campus: "Cơ sở Quận 1", status: "PENDING" },
  { id: "av-010", teacherId: "teacher-002", day: "sun", startTime: "08:30", endTime: "11:30", campus: "Cơ sở Quận 1", status: "APPROVED" },

  { id: "av-011", teacherId: "teacher-003", day: "mon", startTime: "14:00", endTime: "17:00", campus: "Cơ sở Quận 3", status: "APPROVED" },
  { id: "av-012", teacherId: "teacher-003", day: "wed", startTime: "08:30", endTime: "11:30", campus: "Cơ sở Quận 3", status: "APPROVED" },
  { id: "av-013", teacherId: "teacher-003", day: "thu", startTime: "18:00", endTime: "21:00", campus: "Cơ sở Quận 3", status: "APPROVED" },
  { id: "av-014", teacherId: "teacher-003", day: "fri", startTime: "14:00", endTime: "17:00", campus: "Cơ sở Quận 3", status: "APPROVED" },
  { id: "av-015", teacherId: "teacher-003", day: "sat", startTime: "18:00", endTime: "21:00", campus: "Cơ sở Quận 3", status: "APPROVED" },
];

export const weekDays = [
  { key: "mon", label: "T2", date: "2026-10-12", displayDate: "12/10" },
  { key: "tue", label: "T3", date: "2026-10-13", displayDate: "13/10" },
  { key: "wed", label: "T4", date: "2026-10-14", displayDate: "14/10" },
  { key: "thu", label: "T5", date: "2026-10-15", displayDate: "15/10" },
  { key: "fri", label: "T6", date: "2026-10-16", displayDate: "16/10" },
  { key: "sat", label: "T7", date: "2026-10-17", displayDate: "17/10" },
  { key: "sun", label: "CN", date: "2026-10-18", displayDate: "18/10" },
];

export function isTimeInsideAvailability(availability, startTime, endTime) {
  return (
    availability.status === "APPROVED" &&
    startTime >= availability.startTime &&
    endTime <= availability.endTime
  );
}
