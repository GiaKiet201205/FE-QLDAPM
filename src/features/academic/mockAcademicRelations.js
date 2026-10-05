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

export const initialClassAccessScopes = [
  {
    id: "class-scope-001",
    userId: "cs-001",
    role: "CS",
    classId: "class-0001",
    status: "ACTIVE",
    source: "ASSIGNED_SCOPE",
  },
  {
    id: "class-scope-002",
    userId: "cs-001",
    role: "CS",
    classId: "class-0003",
    status: "ACTIVE",
    source: "ASSIGNED_SCOPE",
  },
  {
    id: "class-scope-003",
    userId: "cs-001",
    role: "CS",
    classId: "class-0006",
    status: "ACTIVE",
    source: "ASSIGNED_SCOPE",
  },
];

export const initialClassStudents = seededStudents.slice(0, 36).map((student, index) => {
  const classId = classIds[index % classIds.length];

  return {
    id: `class-student-${String(index + 1).padStart(3, "0")}`,
    classId,
    studentId: student.id,
    status: classId === "class-0005" ? "INACTIVE" : "ACTIVE",
  };
});


export const initialStudentTargets = seededStudents.flatMap(
  (student, index) => {
    const targets = [];

    const toeicLrValues = [450, 550, 650, 750, 850, 900];
    const toeicSwValues = [120, 180, 220, 280, 320, 360];

    targets.push(
      {
        id: `student-target-toeic-lr-${String(index + 1).padStart(3, "0")}`,
        studentId: student.id,
        courseId: "course-toeic",
        targetType: "LR_TOTAL",
        targetValue: toeicLrValues[index % toeicLrValues.length],
      },
      {
        id: `student-target-toeic-sw-${String(index + 1).padStart(3, "0")}`,
        studentId: student.id,
        courseId: "course-toeic",
        targetType: "SW_TOTAL",
        targetValue: toeicSwValues[index % toeicSwValues.length],
      },
    );

    if (index % 2 === 0) {
      targets.push({
        id: `student-target-ielts-${String(index + 1).padStart(3, "0")}`,
        studentId: student.id,
        courseId: "course-ielts",
        targetType: "OVERALL_BAND",
        targetValue: 5.5 + (index % 5) * 0.5,
      });
    }

    if (index % 3 === 0) {
      targets.push({
        id: `student-target-sat-${String(index + 1).padStart(3, "0")}`,
        studentId: student.id,
        courseId: "course-sat",
        targetType: "TOTAL",
        targetValue: 1000 + (index % 6) * 100,
      });
    }

    if (index % 4 === 0) {
      targets.push({
        id: `student-target-toefl-${String(index + 1).padStart(3, "0")}`,
        studentId: student.id,
        courseId: "course-toefl",
        targetType: "OVERALL_1_6",
        targetValue: 3.5 + (index % 5) * 0.5,
      });
    }

    return targets;
  },
);

export const initialClassTargetRequirements = [
  {
    id: "class-target-001",
    classId: "class-0001",
    targetType: "OVERALL_BAND",
    requiredTarget: 7.5,
  },
  {
    id: "class-target-002",
    classId: "class-0002",
    targetType: "LR_TOTAL",
    requiredTarget: 850,
  },
  {
    id: "class-target-003",
    classId: "class-0002",
    targetType: "SW_TOTAL",
    requiredTarget: 300,
  },
  {
    id: "class-target-004",
    classId: "class-0003",
    targetType: "OVERALL_1_6",
    requiredTarget: 4.5,
  },
  {
    id: "class-target-005",
    classId: "class-0004",
    targetType: "TOTAL",
    requiredTarget: 1300,
  },
  {
    id: "class-target-006",
    classId: "class-0005",
    targetType: "OVERALL_BAND",
    requiredTarget: 6.5,
  },
  {
    id: "class-target-007",
    classId: "class-0006",
    targetType: "OVERALL_BAND",
    requiredTarget: 7,
  },
  {
    id: "class-target-008",
    classId: "class-0007",
    targetType: "LR_TOTAL",
    requiredTarget: 650,
  },
  {
    id: "class-target-009",
    classId: "class-0007",
    targetType: "SW_TOTAL",
    requiredTarget: 200,
  },
  {
    id: "class-target-010",
    classId: "class-0008",
    targetType: "TOTAL",
    requiredTarget: 1100,
  },
];


export const initialAssignments = [
  { id: "assignment-001", teacherId: "teacher-001", classId: "class-0001", title: "Writing Task 2 Practice", description: "Opinion essay practice.", deadline: "2026-10-18", status: "OPEN", createdAt: "2026-10-05T09:00:00.000Z" },
  { id: "assignment-002", teacherId: "teacher-001", classId: "class-0006", title: "Coherence and Cohesion Drill", description: "Paragraph organization exercise.", deadline: "2026-10-28", status: "OPEN", createdAt: "2026-10-05T10:00:00.000Z" },
];

export const initialExams = [
  { id: "exam-001", teacherId: "teacher-001", classId: "class-0001", title: "Mid-course Mock Test", description: "Full IELTS mock.", duration: 150, examDate: "2026-11-10", status: "SCHEDULED" },
  { id: "exam-002", teacherId: "teacher-003", classId: "class-0003", title: "TOEFL Progress Test", description: "Progress checkpoint.", duration: 120, examDate: "2026-10-30", status: "SCHEDULED" },
];

const classOneStudents = seededStudents
  .filter((_, index) => index % classIds.length === 0)
  .slice(0, 8);

export const initialStudentResults = classOneStudents.map((student, index) => ({
  id: `result-${String(index + 1).padStart(3, "0")}`,
  studentId: student.id,
  classId: "class-0001",
  assignmentId: index % 2 === 0 ? "assignment-001" : null,
  examId: index % 2 === 1 ? "exam-001" : null,
  score: index % 2 === 0 ? 7 + (index % 3) * 0.5 : 6.5 + (index % 3) * 0.5,
  feedback:
    index % 2 === 0
      ? "Good structure; improve lexical range."
      : "Solid progress; review listening accuracy.",
  evaluatedBy: "teacher-001",
  evaluatedAt: "2026-10-05T11:00:00.000Z",
}));

export function getTeacherName(teacherId) {
  return teachers.find((teacher) => teacher.id === teacherId)?.fullName ?? teacherId;
}
