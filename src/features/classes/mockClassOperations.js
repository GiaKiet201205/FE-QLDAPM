export const demoActors = {
  ADMIN: { id: "admin-001", fullName: "System Admin" },
  CS: { id: "cs-001", fullName: "Current CS" },
};

export const csUsers = [
  { id: "cs-001", fullName: "Current CS", employeeCode: "CS-001" },
  { id: "cs-002", fullName: "Nguyen Minh Chau", employeeCode: "CS-002" },
  { id: "cs-003", fullName: "Tran Quoc Huy", employeeCode: "CS-003" },
];

export const saleUsers = [
  { id: "sale-001", fullName: "Nguyen Thu Ha", employeeCode: "SALE-001" },
  { id: "sale-002", fullName: "Le Minh Khoa", employeeCode: "SALE-002" },
  { id: "sale-003", fullName: "Pham Gia Han", employeeCode: "SALE-003" },
];

export const initialStaffSchedules = [
  { id: "staff-schedule-001", userId: "cs-001", staffRole: "CS", workplaceId: "center-01", classId: "class-0001", date: "2026-10-06", startTime: "17:30", endTime: "20:30", workType: "CLASS_SUPPORT", status: "ASSIGNED", assignedBy: "cm-001" },
  { id: "staff-schedule-002", userId: "cs-001", staffRole: "CS", workplaceId: "center-01", classId: "class-0003", date: "2026-10-08", startTime: "17:30", endTime: "20:30", workType: "CLASS_SUPPORT", status: "ASSIGNED", assignedBy: "cm-001" },
  { id: "staff-schedule-003", userId: "cs-002", staffRole: "CS", workplaceId: "center-01", classId: "class-0002", date: "2026-10-12", startTime: "17:30", endTime: "20:30", workType: "CLASS_SUPPORT", status: "ASSIGNED", assignedBy: "cm-001" },
  { id: "staff-schedule-004", userId: "cs-001", staffRole: "CS", workplaceId: "center-02", classId: "class-0006", date: "2026-10-20", startTime: "18:00", endTime: "21:00", workType: "CLASS_SUPPORT", status: "ASSIGNED", assignedBy: "cm-002" },
  { id: "staff-schedule-005", userId: "cs-003", staffRole: "CS", workplaceId: "center-02", classId: "class-0001", date: "2026-10-09", startTime: "17:30", endTime: "20:30", workType: "CLASS_SUPPORT", status: "ASSIGNED", assignedBy: "cm-001" },
  { id: "staff-schedule-006", userId: "sale-001", staffRole: "SALE", workplaceId: "center-01", classId: null, date: "2026-10-12", startTime: "08:30", endTime: "11:30", workType: "SALES_SHIFT", status: "ASSIGNED", assignedBy: "cm-001" },
  { id: "staff-schedule-007", userId: "sale-002", staffRole: "SALE", workplaceId: "center-02", classId: null, date: "2026-10-14", startTime: "14:00", endTime: "17:00", workType: "LEAD_FOLLOWUP", status: "ASSIGNED", assignedBy: "cm-001" },
  { id: "staff-schedule-008", userId: "sale-003", staffRole: "SALE", workplaceId: "center-01", classId: null, date: "2026-10-16", startTime: "18:00", endTime: "21:00", workType: "CONSULTATION", status: "ASSIGNED", assignedBy: "cm-001" },
  { id: "staff-schedule-009", userId: "cs-001", staffRole: "CS", workplaceId: "center-01", classId: "class-0001", date: "2026-10-12", startTime: "17:30", endTime: "20:30", workType: "CLASS_SUPPORT", status: "ASSIGNED", assignedBy: "cm-001" },
  { id: "staff-schedule-010", userId: "cs-001", staffRole: "CS", workplaceId: "center-01", classId: null, date: "2026-10-14", startTime: "08:30", endTime: "11:30", workType: "FRONT_DESK", status: "ASSIGNED", assignedBy: "cm-001" },
  { id: "staff-schedule-011", userId: "cs-001", staffRole: "CS", workplaceId: "center-01", classId: null, date: "2026-10-16", startTime: "14:00", endTime: "17:00", workType: "OPERATIONS_SUPPORT", status: "ASSIGNED", assignedBy: "cm-001" },
  { id: "staff-schedule-012", userId: "sale-001", staffRole: "SALE", workplaceId: "center-01", classId: null, date: "2026-10-14", startTime: "14:00", endTime: "17:00", workType: "LEAD_FOLLOWUP", status: "ASSIGNED", assignedBy: "cm-001" },
  { id: "staff-schedule-013", userId: "sale-001", staffRole: "SALE", workplaceId: "center-01", classId: null, date: "2026-10-16", startTime: "18:00", endTime: "21:00", workType: "CONSULTATION", status: "ASSIGNED", assignedBy: "cm-001" },
];

export const initialAuditLogs = [];

export function getActorForRole(roleKey) {
  return demoActors[roleKey] ?? { id: "staff-demo", fullName: roleKey };
}

export function getCsName(userId) {
  return csUsers.find((user) => user.id === userId)?.fullName ?? userId;
}
