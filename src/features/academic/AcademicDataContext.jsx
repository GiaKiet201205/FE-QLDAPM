import { createContext, useContext, useMemo, useState } from "react";
import { seededStudents } from "../students/mockStudents";
import { initialClasses, classStatuses } from "../classes/mockClasses";
import { initialAuditLogs, initialStaffSchedules } from "../classes/mockClassOperations";
import {
  initialAssignments,
  initialClassAccessScopes,
  initialClassStudents,
  initialExams,
  initialStudentResults,
  initialTeachingSchedules,
} from "./mockAcademicRelations";

const AcademicDataContext = createContext(null);

function auditEntry(actor, action, entityType, entityId, details = {}) {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    userId: actor.id,
    userName: actor.fullName,
    action,
    entityType,
    entityId,
    details,
    createdAt: new Date().toISOString(),
  };
}

export function AcademicDataProvider({ children }) {
  const [students, setStudents] = useState(seededStudents);
  const [classes, setClasses] = useState(initialClasses);
  const [classStudents, setClassStudents] = useState(initialClassStudents);
  const [classAccessScopes, setClassAccessScopes] = useState(initialClassAccessScopes);
  const [teachingSchedules] = useState(initialTeachingSchedules);
  const [staffSchedules, setStaffSchedules] = useState(initialStaffSchedules);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [exams, setExams] = useState(initialExams);
  const [studentResults, setStudentResults] = useState(initialStudentResults);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);

  function addAudit(actor, action, entityType, entityId, details) {
    setAuditLogs((current) => [
      auditEntry(actor, action, entityType, entityId, details),
      ...current,
    ]);
  }

  function canManageClass(actor, classId) {
    if (actor.role === "ADMIN") return true;
    if (actor.role !== "CS") return false;

    return classAccessScopes.some(
      (scope) =>
        scope.role === "CS" &&
        scope.userId === actor.id &&
        scope.classId === classId &&
        scope.status === "ACTIVE",
    );
  }

  function isTeacherAssigned(actor, classId) {
    if (actor.role !== "TEACHER") return false;

    return teachingSchedules.some(
      (schedule) =>
        schedule.teacherId === actor.id &&
        schedule.classId === classId &&
        schedule.status === "ASSIGNED",
    );
  }

  function addStudent(form, actor) {
    if (actor.role !== "ADMIN") {
      return { ok: false, reason: "Only Admin can create student records." };
    }

    const duplicate = students.some(
      (student) =>
        student.studentCode.trim().toLowerCase() ===
        form.studentCode.trim().toLowerCase(),
    );
    if (duplicate) return { ok: false, reason: "Student code already exists." };

    const student = {
      ...form,
      id: `student-${Date.now()}`,
      tone: "navy",
    };
    setStudents((current) => [student, ...current]);
    addAudit(actor, "CREATE_STUDENT", "STUDENT", student.id, {
      studentCode: student.studentCode,
    });
    return { ok: true, student };
  }

  function updateStudent(studentId, form, actor) {
    if (actor.role !== "ADMIN") {
      return { ok: false, reason: "Only Admin can update student records." };
    }

    const duplicate = students.some(
      (student) =>
        student.id !== studentId &&
        student.studentCode.trim().toLowerCase() ===
          form.studentCode.trim().toLowerCase(),
    );
    if (duplicate) return { ok: false, reason: "Student code already exists." };

    setStudents((current) =>
      current.map((student) =>
        student.id === studentId ? { ...student, ...form } : student,
      ),
    );
    addAudit(actor, "UPDATE_STUDENT", "STUDENT", studentId, {
      studentCode: form.studentCode,
    });
    return { ok: true };
  }

  function deleteStudent(studentId, actor) {
    if (actor.role !== "ADMIN") {
      return { ok: false, reason: "Only Admin can delete student records." };
    }

    const hasClassHistory = classStudents.some(
      (relation) => relation.studentId === studentId,
    );
    const hasResults = studentResults.some(
      (result) => result.studentId === studentId,
    );

    if (hasClassHistory || hasResults) {
      return {
        ok: false,
        reason:
          "This student already has class or academic history. Keep the record and change its status instead of deleting it.",
      };
    }

    setStudents((current) =>
      current.filter((student) => student.id !== studentId),
    );
    addAudit(actor, "DELETE_STUDENT", "STUDENT", studentId);
    return { ok: true };
  }

  function assignStudentsToClass(studentIds, classId, actor) {
    if (!canManageClass(actor, classId)) {
      return {
        ok: false,
        reason: "You do not have permission to manage students in this class.",
      };
    }

    const activeIds = new Set(
      classStudents
        .filter(
          (relation) =>
            relation.classId === classId && relation.status === "ACTIVE",
        )
        .map((relation) => relation.studentId),
    );

    const candidateIds = studentIds.filter(
      (studentId) => !activeIds.has(studentId),
    );

    if (!candidateIds.length) {
      return {
        ok: false,
        reason: "Selected students are already active in this class.",
      };
    }

    const timestamp = Date.now();

    setClassStudents((current) => {
      const next = [...current];

      candidateIds.forEach((studentId, index) => {
        const historicalIndex = next.findIndex(
          (relation) =>
            relation.classId === classId &&
            relation.studentId === studentId,
        );

        if (historicalIndex >= 0) {
          next[historicalIndex] = {
            ...next[historicalIndex],
            status: "ACTIVE",
          };
        } else {
          next.push({
            id: `class-student-${timestamp}-${index}`,
            classId,
            studentId,
            status: "ACTIVE",
          });
        }
      });

      return next;
    });

    addAudit(actor, "ADD_STUDENTS_TO_CLASS", "CLASS", classId, {
      studentIds: candidateIds,
    });
    return { ok: true, added: candidateIds.length };
  }

  function removeStudentFromClass(studentId, classId, actor) {
    if (!canManageClass(actor, classId)) {
      return {
        ok: false,
        reason: "You do not have permission to manage students in this class.",
      };
    }

    setClassStudents((current) =>
      current.map((relation) =>
        relation.studentId === studentId &&
        relation.classId === classId &&
        relation.status === "ACTIVE"
          ? { ...relation, status: "INACTIVE" }
          : relation,
      ),
    );
    addAudit(actor, "REMOVE_STUDENT_FROM_CLASS", "CLASS", classId, {
      studentId,
      relationshipStatus: "INACTIVE",
    });
    return { ok: true };
  }

  function addClass(form, actor) {
    if (!["ADMIN", "CS"].includes(actor.role)) {
      return { ok: false, reason: "Only Admin or CS can create classes." };
    }

    const duplicate = classes.some(
      (classItem) =>
        classItem.classCode.trim().toLowerCase() ===
        form.classCode.trim().toLowerCase(),
    );
    if (duplicate) return { ok: false, reason: "Class code already exists." };

    const classItem = {
      ...form,
      status: "DRAFT",
      id: `class-${Date.now()}`,
      createdBy: actor.id,
    };
    setClasses((current) => [classItem, ...current]);

    if (actor.role === "CS") {
      setClassAccessScopes((current) => [
        {
          id: `class-scope-${Date.now()}`,
          userId: actor.id,
          role: "CS",
          classId: classItem.id,
          status: "ACTIVE",
          source: "CREATED_BY_CS",
        },
        ...current,
      ]);
    }

    addAudit(actor, "CREATE_CLASS", "CLASS", classItem.id, {
      classCode: classItem.classCode,
    });
    return { ok: true, classItem };
  }

  function updateClass(classId, form, actor) {
    if (!canManageClass(actor, classId)) {
      return {
        ok: false,
        reason: "You do not have permission to update this class.",
      };
    }

    const duplicate = classes.some(
      (classItem) =>
        classItem.id !== classId &&
        classItem.classCode.trim().toLowerCase() ===
          form.classCode.trim().toLowerCase(),
    );
    if (duplicate) return { ok: false, reason: "Class code already exists." };

    setClasses((current) =>
      current.map((classItem) =>
        classItem.id === classId
          ? { ...classItem, ...form, status: classItem.status }
          : classItem,
      ),
    );
    addAudit(actor, "UPDATE_CLASS", "CLASS", classId, {
      classCode: form.classCode,
      name: form.name,
    });
    return { ok: true };
  }

  function advanceClassStatus(classId, nextStatus, actor) {
    if (!canManageClass(actor, classId)) {
      return {
        ok: false,
        reason: "You do not have permission to change this class status.",
      };
    }

    const classItem = classes.find((item) => item.id === classId);
    if (!classItem) return { ok: false, reason: "Class not found." };

    const currentIndex = classStatuses.indexOf(classItem.status);
    const expected = classStatuses[currentIndex + 1];
    if (nextStatus !== expected) {
      return { ok: false, reason: "Invalid class status transition." };
    }

    setClasses((current) =>
      current.map((item) =>
        item.id === classId ? { ...item, status: nextStatus } : item,
      ),
    );
    addAudit(actor, "CHANGE_CLASS_STATUS", "CLASS", classId, {
      from: classItem.status,
      to: nextStatus,
    });
    return { ok: true };
  }

  function overrideSupport(
    scheduleId,
    newCsId,
    reason,
    actor,
    allowConflict = false,
  ) {
    if (actor.role !== "ADMIN") {
      return {
        ok: false,
        reason: "Only Admin can perform an administrative override.",
      };
    }

    const schedule = staffSchedules.find((item) => item.id === scheduleId);
    if (!schedule) return { ok: false, reason: "Support schedule not found." };

    const overlaps = (aStart, aEnd, bStart, bEnd) =>
      aStart < bEnd && bStart < aEnd;

    const conflicts = staffSchedules.filter(
      (item) =>
        item.id !== scheduleId &&
        item.userId === newCsId &&
        item.status === "ASSIGNED" &&
        item.date === schedule.date &&
        overlaps(
          schedule.startTime,
          schedule.endTime,
          item.startTime,
          item.endTime,
        ),
    );

    if (conflicts.length && !allowConflict) {
      return {
        ok: false,
        code: "SCHEDULE_CONFLICT",
        reason:
          "The replacement CS already has an overlapping assigned shift. Confirm an administrative bypass only when necessary.",
        conflicts,
      };
    }

    setStaffSchedules((current) =>
      current.map((item) =>
        item.id === scheduleId
          ? {
              ...item,
              userId: newCsId,
              assignedBy: actor.id,
              assignmentSource: "ADMIN_OVERRIDE",
            }
          : item,
      ),
    );
    addAudit(actor, "OVERRIDE_CS_SUPPORT", "CLASS", schedule.classId, {
      scheduleId,
      fromCs: schedule.userId,
      toCs: newCsId,
      reason,
      conflictBypass: allowConflict,
      conflictCount: conflicts.length,
    });
    return { ok: true };
  }

  function addAssignment(data, actor) {
    if (!isTeacherAssigned(actor, data.classId)) {
      return {
        ok: false,
        reason: "Teacher can only create assignments for assigned classes.",
      };
    }

    const assignment = {
      ...data,
      id: `assignment-${Date.now()}`,
      teacherId: actor.id,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };
    setAssignments((current) => [assignment, ...current]);
    addAudit(actor, "CREATE_ASSIGNMENT", "CLASS", assignment.classId, {
      assignmentId: assignment.id,
    });
    return assignment;
  }

  function addExam(data, actor) {
    if (!isTeacherAssigned(actor, data.classId)) {
      return {
        ok: false,
        reason: "Teacher can only create exams for assigned classes.",
      };
    }

    const exam = {
      ...data,
      id: `exam-${Date.now()}`,
      teacherId: actor.id,
      status: "SCHEDULED",
    };
    setExams((current) => [exam, ...current]);
    addAudit(actor, "CREATE_EXAM", "CLASS", exam.classId, { examId: exam.id });
    return exam;
  }

  function upsertStudentResult(data, actor) {
    if (!isTeacherAssigned(actor, data.classId)) {
      return {
        ok: false,
        reason: "Teacher can only evaluate students in assigned classes.",
      };
    }

    const studentInClass = classStudents.some(
      (relation) =>
        relation.classId === data.classId &&
        relation.studentId === data.studentId &&
        relation.status === "ACTIVE",
    );

    if (!studentInClass) {
      return {
        ok: false,
        reason: "Student is not currently active in this class.",
      };
    }

    const existing = studentResults.find(
      (result) =>
        result.studentId === data.studentId &&
        result.classId === data.classId &&
        result.assignmentId === (data.assignmentId ?? null) &&
        result.examId === (data.examId ?? null),
    );

    if (existing) {
      setStudentResults((current) =>
        current.map((result) =>
          result.id === existing.id
            ? {
                ...result,
                score: data.score,
                feedback: data.feedback,
                evaluatedBy: actor.id,
                evaluatedAt: new Date().toISOString(),
              }
            : result,
        ),
      );
    } else {
      setStudentResults((current) => [
        {
          id: `result-${Date.now()}`,
          studentId: data.studentId,
          classId: data.classId,
          assignmentId: data.assignmentId ?? null,
          examId: data.examId ?? null,
          score: data.score,
          feedback: data.feedback,
          evaluatedBy: actor.id,
          evaluatedAt: new Date().toISOString(),
        },
        ...current,
      ]);
    }

    addAudit(actor, "EVALUATE_STUDENT", "CLASS", data.classId, {
      studentId: data.studentId,
    });
  }

  const value = useMemo(
    () => ({
      students,
      classes,
      classStudents,
      classAccessScopes,
      teachingSchedules,
      staffSchedules,
      assignments,
      exams,
      studentResults,
      auditLogs,
      addStudent,
      updateStudent,
      deleteStudent,
      assignStudentsToClass,
      removeStudentFromClass,
      addClass,
      updateClass,
      advanceClassStatus,
      overrideSupport,
      addAssignment,
      addExam,
      upsertStudentResult,
    }),
    [
      students,
      classes,
      classStudents,
      classAccessScopes,
      teachingSchedules,
      staffSchedules,
      assignments,
      exams,
      studentResults,
      auditLogs,
    ],
  );

  return (
    <AcademicDataContext.Provider value={value}>
      {children}
    </AcademicDataContext.Provider>
  );
}

export function useAcademicData() {
  const context = useContext(AcademicDataContext);
  if (!context) {
    throw new Error("useAcademicData must be used inside AcademicDataProvider");
  }
  return context;
}
