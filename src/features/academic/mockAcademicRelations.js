import { seededStudents } from "../students/mockStudents";

export const teachers = [
  { id: "teacher-001", fullName: "David Miller", teacherCode: "GV-001" },
  { id: "teacher-002", fullName: "Helena Costa", teacherCode: "GV-002" },
  { id: "teacher-003", fullName: "Robert Taylor", teacherCode: "GV-003" },
];

export const demoTeacherId = "teacher-001";

export const initialTeachingSchedules = [
  { id: "teaching-001", teacherId: "teacher-001", classId: "class-0001", date: "2026-10-06", startTime: "18:30", endTime: "20:30", status: "ASSIGNED", assignedBy: "tc-001" },
  { id: "teaching-002", teacherId: "teacher-001", classId: "class-0001", date: "2026-10-08", startTime: "18:30", endTime: "20:30", status: "ASSIGNED", assignedBy: "tc-001" },
  { id: "teaching-003", teacherId: "teacher-002", classId: "class-0002", date: "2026-10-12", startTime: "08:30", endTime: "10:30", status: "ASSIGNED", assignedBy: "tc-001" },
  { id: "teaching-004", teacherId: "teacher-003", classId: "class-0003", date: "2026-10-08", startTime: "18:30", endTime: "20:30", status: "ASSIGNED", assignedBy: "tc-001" },
  { id: "teaching-005", teacherId: "teacher-001", classId: "class-0005", date: "2026-10-07", startTime: "14:00", endTime: "16:00", status: "ASSIGNED", assignedBy: "tc-001" },
  { id: "teaching-006", teacherId: "teacher-001", classId: "class-0006", date: "2026-10-21", startTime: "18:30", endTime: "20:30", status: "ASSIGNED", assignedBy: "tc-001" },
];

const classIds = [
  "class-0001",
  "class-0002",
  "class-0003",
  "class-0005",
  "class-0006",
];

export const initialClassStudents = seededStudents.slice(0, 36).map((student, index) => ({
  id: `class-student-${String(index + 1).padStart(3, "0")}`,
  classId: classIds[index % classIds.length],
  studentId: student.id,
  status: "ACTIVE",
}));

export const initialAssignments = [
  { id: "assignment-001", teacherId: "teacher-001", classId: "class-0001", title: "Writing Task 2 Practice", description: "Opinion essay practice.", deadline: "2026-10-18", status: "OPEN", createdAt: "2026-10-05T09:00:00.000Z" },
  { id: "assignment-002", teacherId: "teacher-001", classId: "class-0006", title: "Coherence and Cohesion Drill", description: "Paragraph organization exercise.", deadline: "2026-10-28", status: "OPEN", createdAt: "2026-10-05T10:00:00.000Z" },
];

export const initialExams = [
  { id: "exam-001", teacherId: "teacher-001", classId: "class-0001", title: "Mid-course Mock Test", description: "Full IELTS mock.", duration: 150, examDate: "2026-11-10", status: "SCHEDULED" },
  { id: "exam-002", teacherId: "teacher-003", classId: "class-0003", title: "TOEFL Progress Test", description: "Progress checkpoint.", duration: 120, examDate: "2026-10-30", status: "SCHEDULED" },
];

export const initialStudentResults = seededStudents.slice(0, 8).map((student, index) => ({
  id: `result-${String(index + 1).padStart(3, "0")}`,
  studentId: student.id,
  classId: "class-0001",
  assignmentId: index % 2 === 0 ? "assignment-001" : null,
  examId: index % 2 === 1 ? "exam-001" : null,
  score: index % 2 === 0 ? 7 + (index % 3) * 0.5 : 6.5 + (index % 3) * 0.5,
  feedback: index % 2 === 0 ? "Good structure; improve lexical range." : "Solid progress; review listening accuracy.",
  evaluatedBy: "teacher-001",
  evaluatedAt: "2026-10-05T11:00:00.000Z",
]));

export function getTeacherName(teacherId) {
  return teachers.find((teacher) => teacher.id === teacherId)?.fullName ?? teacherId;
}
