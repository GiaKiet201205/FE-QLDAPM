export const classStatuses = [
  "DRAFT",
  "READY",
  "RUNNING",
  "COMPLETED",
  "CLOSED",
];

export const courses = [
  { id: "course-ielts", name: "IELTS" },
  { id: "course-toeic", name: "TOEIC" },
  { id: "course-sat", name: "SAT" },
  { id: "course-toefl", name: "TOEFL iBT" },
];

export const PAGE_SIZE = 7;

export const emptyClassForm = {
  courseId: courses[0].id,
  classCode: "",
  name: "",
  requiredTargets: {},
  startDate: "",
  endDate: "",
  status: "DRAFT",
};
