export const demoActors = {
  ADMIN: { id: "admin-001", fullName: "System Admin" },
  CS: { id: "cs-001", fullName: "Current CS" },
};

export const csUsers = [
  { id: "cs-001", fullName: "Current CS", employeeCode: "CS-001" },
  { id: "cs-002", fullName: "Nguyen Minh Chau", employeeCode: "CS-002" },
  { id: "cs-003", fullName: "Tran Quoc Huy", employeeCode: "CS-003" },
];

export const initialStaffSchedules = [
  { id: "staff-schedule-001", userId: "cs-001", staffRole: "CS", workplaceId: "center-01", classId: "class-0001", date: "2026-10-06", startTime: "17:30", endTime: "20:30", workType: "CLASS_SUPPORT", status: "ASSIGNED", assignedBy: "cm-001" },
  { id: "staff-schedule-002", userId: "cs-001", staffRole: "CS", workplaceId: "center-01", classId: "class-0003", date: "2026-10-08", startTime: "17:30", endTime: "20:30", workType: "CLASS_SUPPORT", status: "ASSIGNED", assignedBy: "cm-001" },
  { id: "staff-schedule-003", userId: "cs-002", staffRole: "CS", workplaceId: "center-01", classId: "class-0002", date: "2026-10-12", startTime: "17:30", endTime: "20:30", workType: "CLASS_SUPPORT", status: "ASSIGNED", assignedBy: "cm-001" },
  { id: "staff-schedule-004", userId: "cs-001", staffRole: "CS", workplaceId: "center-02", classId: "class-0006", date: "2026-10-20", startTime: "18:00", endTime: "21:00", workType: "CLASS_SUPPORT", status: "ASSIGNED", assignedBy: "cm-002" },
  { id: "staff-schedule-005", userId: "cs-003", staffRole: "CS", workplaceId: "center-02", classId: "class-0001", date: "2026-10-09", startTime: "17:30", endTime: "20:30", workType: "CLASS_SUPPORT", status: "ASSIGNED", assignedBy: "cm-001" },
];

export const initialAuditLogs = [];

export function getActorForRole(roleKey) {
  return demoActors[roleKey] ?? { id: "staff-demo", fullName: roleKey };
}

export function getCsName(userId) {
  return csUsers.find((user) => user.id === userId)?.fullName ?? userId;
}
