import { createContext, useContext, useMemo, useState } from "react";
import { seededStudents } from "../students/mockStudents";
import { initialClasses, classStatuses } from "../classes/mockClasses";
import { initialAuditLogs, initialStaffSchedules } from "../classes/mockClassOperations";
import {
  initialAssignments,
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

  function addStudent(form, actor) {
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
    const hasResults = studentResults.some((result) => result.studentId === studentId);
    if (hasResults) {
      return {
        ok: false,
        reason:
          "This student has academic results. Keep the record for history or change its status instead.",
      };
    }
    setStudents((current) => current.filter((student) => student.id !== studentId));
    setClassStudents((current) =>
      current.filter((relation) => relation.studentId !== studentId),
    );
    addAudit(actor, "DELETE_STUDENT", "STUDENT", studentId);
    return { ok: true };
  }

  function assignStudentsToClass(studentIds, classId, actor) {
    const existing = new Set(
      classStudents
        .filter((relation) => relation.classId === classId)
        .map((relation) => relation.studentId),
    );
    const newIds = studentIds.filter((studentId) => !existing.has(studentId));
    if (!newIds.length) return { ok: false, reason: "Selected students are already in this class." };

    const timestamp = Date.now();
    const additions = newIds.map((studentId, index) => ({
      id: `class-student-${timestamp}-${index}`,
      classId,
      studentId,
      status: "ACTIVE",
    }));
    setClassStudents((current) => [...current, ...additions]);
    addAudit(actor, "ADD_STUDENTS_TO_CLASS", "CLASS", classId, {
      studentIds: newIds,
    });
    return { ok: true, added: newIds.length };
  }

  function removeStudentFromClass(studentId, classId, actor) {
    setClassStudents((current) =>
      current.filter(
        (relation) =>
          !(relation.studentId === studentId && relation.classId === classId),
      ),
    );
    addAudit(actor, "REMOVE_STUDENT_FROM_CLASS", "CLASS", classId, {
      studentId,
    });
  }

  function addClass(form, actor) {
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
    addAudit(actor, "CREATE_CLASS", "CLASS", classItem.id, {
      classCode: classItem.classCode,
    });
    return { ok: true, classItem };
  }

  function updateClass(classId, form, actor) {
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

  function overrideSupport(scheduleId, newCsId, reason, actor) {
    const schedule = staffSchedules.find((item) => item.id === scheduleId);
    if (!schedule) return { ok: false, reason: "Support schedule not found." };

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
    });
    return { ok: true };
  }

  function addAssignment(data, actor) {
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
