export const staffAvailability = [
  { id: "sav-001", userId: "sale-001", staffRole: "SALE", day: "mon", startTime: "08:30", endTime: "11:30", workplaceId: "center-01", status: "APPROVED" },
  { id: "sav-002", userId: "sale-001", staffRole: "SALE", day: "wed", startTime: "14:00", endTime: "17:00", workplaceId: "center-01", status: "APPROVED" },
  { id: "sav-003", userId: "sale-001", staffRole: "SALE", day: "fri", startTime: "18:00", endTime: "21:00", workplaceId: "center-01", status: "APPROVED" },

  { id: "sav-004", userId: "sale-002", staffRole: "SALE", day: "tue", startTime: "08:30", endTime: "11:30", workplaceId: "center-02", status: "APPROVED" },
  { id: "sav-005", userId: "sale-002", staffRole: "SALE", day: "wed", startTime: "14:00", endTime: "17:00", workplaceId: "center-02", status: "APPROVED" },
  { id: "sav-006", userId: "sale-002", staffRole: "SALE", day: "sat", startTime: "08:30", endTime: "11:30", workplaceId: "center-02", status: "PENDING" },

  { id: "sav-007", userId: "sale-003", staffRole: "SALE", day: "mon", startTime: "14:00", endTime: "17:00", workplaceId: "center-01", status: "APPROVED" },
  { id: "sav-008", userId: "sale-003", staffRole: "SALE", day: "thu", startTime: "08:30", endTime: "11:30", workplaceId: "center-01", status: "APPROVED" },
  { id: "sav-009", userId: "sale-003", staffRole: "SALE", day: "fri", startTime: "18:00", endTime: "21:00", workplaceId: "center-01", status: "APPROVED" },

  { id: "sav-010", userId: "cs-001", staffRole: "CS", day: "mon", startTime: "17:30", endTime: "21:00", workplaceId: "center-01", status: "APPROVED" },
  { id: "sav-011", userId: "cs-001", staffRole: "CS", day: "wed", startTime: "17:30", endTime: "21:00", workplaceId: "center-01", status: "APPROVED" },
  { id: "sav-012", userId: "cs-001", staffRole: "CS", day: "fri", startTime: "17:30", endTime: "21:00", workplaceId: "center-01", status: "APPROVED" },

  { id: "sav-013", userId: "cs-002", staffRole: "CS", day: "tue", startTime: "14:00", endTime: "17:00", workplaceId: "center-01", status: "APPROVED" },
  { id: "sav-014", userId: "cs-002", staffRole: "CS", day: "thu", startTime: "17:30", endTime: "21:00", workplaceId: "center-01", status: "APPROVED" },
  { id: "sav-015", userId: "cs-002", staffRole: "CS", day: "sun", startTime: "08:30", endTime: "11:30", workplaceId: "center-01", status: "APPROVED" },

  { id: "sav-016", userId: "cs-003", staffRole: "CS", day: "mon", startTime: "08:30", endTime: "11:30", workplaceId: "center-02", status: "APPROVED" },
  { id: "sav-017", userId: "cs-003", staffRole: "CS", day: "thu", startTime: "14:00", endTime: "17:00", workplaceId: "center-02", status: "PENDING" },
  { id: "sav-018", userId: "cs-003", staffRole: "CS", day: "sat", startTime: "18:00", endTime: "21:00", workplaceId: "center-02", status: "APPROVED" },
];

export const staffWeekDays = [
  { key: "mon", label: "T2", date: "2026-10-12", displayDate: "12/10" },
  { key: "tue", label: "T3", date: "2026-10-13", displayDate: "13/10" },
  { key: "wed", label: "T4", date: "2026-10-14", displayDate: "14/10" },
  { key: "thu", label: "T5", date: "2026-10-15", displayDate: "15/10" },
  { key: "fri", label: "T6", date: "2026-10-16", displayDate: "16/10" },
  { key: "sat", label: "T7", date: "2026-10-17", displayDate: "17/10" },
  { key: "sun", label: "CN", date: "2026-10-18", displayDate: "18/10" },
];

export const workplaceOptions = [
  { id: "center-01", label: "Cơ sở chính" },
  { id: "center-02", label: "Cơ sở Quận 1" },
  { id: "center-03", label: "Cơ sở Quận 3" },
];

export const saleWorkTypes = [
  { value: "SALES_SHIFT", label: "Ca tư vấn tuyển sinh" },
  { value: "LEAD_FOLLOWUP", label: "Chăm sóc lead" },
  { value: "CONSULTATION", label: "Tư vấn trực tiếp" },
];

export const csWorkTypes = [
  { value: "CLASS_SUPPORT", label: "Hỗ trợ lớp học" },
  { value: "OPERATIONS_SUPPORT", label: "Hỗ trợ vận hành" },
  { value: "FRONT_DESK", label: "Trực quầy / CSKH" },
];

export function isStaffTimeInsideAvailability(availability, startTime, endTime) {
  return (
    availability.status === "APPROVED" &&
    startTime >= availability.startTime &&
    endTime <= availability.endTime
  );
}
