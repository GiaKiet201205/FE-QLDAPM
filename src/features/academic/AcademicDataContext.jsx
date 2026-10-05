import { createContext, useContext, useMemo, useState } from "react";
import {
  seededStudents,
  studentStatusTransitions,
} from "../students/mockStudents";
import { initialClasses, classStatuses } from "../classes/mockClasses";
import { initialAuditLogs, initialStaffSchedules } from "../classes/mockClassOperations";
import {
  assignableClassStatuses,
  evaluateStudentClassTarget,
  validateCourseTargetValues,
  validateStudentTargets,
} from "./targetEligibility";
import {
  initialAssignments,
  initialClassAccessScopes,
  initialClassStudents,
  initialClassTargetRequirements,
  initialExams,
  initialStudentResults,
  initialStudentTargets,
  initialTeachingSchedules,
} from "./mockAcademicRelations";

const AcademicDataContext = createContext(null);

const teachingActivityClassStatuses = ["READY", "RUNNING"];
const gradingClassStatuses = ["READY", "RUNNING", "COMPLETED"];

function isValidAssignedTeachingSchedule(schedule, classItem) {
  if (
    !schedule ||
    schedule.status !== "ASSIGNED" ||
    !schedule.teacherId ||
    !schedule.date ||
    !schedule.startTime ||
    !schedule.endTime ||
    schedule.startTime >= schedule.endTime
  ) {
    return false;
  }

  if (classItem?.startDate && schedule.date < classItem.startDate) return false;
  if (classItem?.endDate && schedule.date > classItem.endDate) return false;

  return true;
}

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
  const [studentTargets, setStudentTargets] = useState(initialStudentTargets);
  const [classTargetRequirements, setClassTargetRequirements] = useState(
    initialClassTargetRequirements,
  );
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

  function buildStudentTargetRecords(studentId, targets = {}) {
    return Object.entries(targets).flatMap(([courseId, courseTargets]) =>
      Object.entries(courseTargets ?? {})
        .filter(([, value]) => value !== "" && value != null)
        .map(([targetType, value]) => ({
          id: `student-target-${studentId}-${courseId}-${targetType.toLowerCase()}`,
          studentId,
          courseId,
          targetType,
          targetValue: Number(value),
        })),
    );
  }

  function buildClassTargetRequirementRecords(
    classId,
    courseId,
    requiredTargets = {},
  ) {
    return Object.entries(requiredTargets[courseId] ?? {})
      .filter(([, value]) => value !== "" && value != null)
      .map(([targetType, value]) => ({
        id: `class-target-${classId}-${targetType.toLowerCase()}`,
        classId,
        targetType,
        requiredTarget: Number(value),
      }));
  }

  function syncStudentTargets(studentId, targets = {}) {
    const nextTargets = buildStudentTargetRecords(studentId, targets);

    setStudentTargets((current) => [
      ...current.filter((target) => target.studentId !== studentId),
      ...nextTargets,
    ]);
  }

  function syncClassTargetRequirements(
    classId,
    courseId,
    requiredTargets = {},
  ) {
    const nextRequirements = buildClassTargetRequirementRecords(
      classId,
      courseId,
      requiredTargets,
    );

    setClassTargetRequirements((current) => [
      ...current.filter((requirement) => requirement.classId !== classId),
      ...nextRequirements,
    ]);
  }

  function addStudent(form, actor) {
    if (actor.role !== "ADMIN") {
      return { ok: false, reason: "Only Admin can create student records." };
    }

    const normalizedStudentCode = form.studentCode?.trim();
    const normalizedFullName = form.fullName?.trim();

    if (!normalizedStudentCode || !normalizedFullName) {
      return {
        ok: false,
        reason: "Student code and full name are required.",
      };
    }

    const duplicate = students.some(
      (student) =>
        student.studentCode.trim().toLowerCase() ===
        normalizedStudentCode.toLowerCase(),
    );
    if (duplicate) return { ok: false, reason: "Student code already exists." };

    const targetValidation = validateStudentTargets(form.targets ?? {});
    if (!targetValidation.ok) return targetValidation;

    const { targets, ...studentForm } = form;

    const student = {
      ...studentForm,
      studentCode: normalizedStudentCode,
      fullName: normalizedFullName,
      email: studentForm.email?.trim() ?? "",
      phone: studentForm.phone?.trim() ?? "",
      status: "Active",
      id: `student-${Date.now()}`,
      tone: "navy",
    };
    setStudents((current) => [student, ...current]);
    syncStudentTargets(student.id, targets);
    addAudit(actor, "CREATE_STUDENT", "STUDENT", student.id, {
      studentCode: student.studentCode,
    });
    return { ok: true, student };
  }

  function updateStudent(studentId, form, actor) {
    if (actor.role !== "ADMIN") {
      return { ok: false, reason: "Only Admin can update student records." };
    }

    const normalizedStudentCode = form.studentCode?.trim();
    const normalizedFullName = form.fullName?.trim();

    if (!normalizedStudentCode || !normalizedFullName) {
      return {
        ok: false,
        reason: "Student code and full name are required.",
      };
    }

    const duplicate = students.some(
      (student) =>
        student.id !== studentId &&
        student.studentCode.trim().toLowerCase() ===
          normalizedStudentCode.toLowerCase(),
    );
    if (duplicate) return { ok: false, reason: "Student code already exists." };

    const targetValidation = validateStudentTargets(form.targets ?? {});
    if (!targetValidation.ok) return targetValidation;

    const { targets, status: _ignoredStatus, ...studentForm } = form;

    const currentStudent = students.find((student) => student.id === studentId);
    if (!currentStudent) return { ok: false, reason: "Student not found." };

    const proposedStudent = {
      ...currentStudent,
      ...studentForm,
      studentCode: normalizedStudentCode,
      fullName: normalizedFullName,
      email: studentForm.email?.trim() ?? "",
      phone: studentForm.phone?.trim() ?? "",
    };
    const proposedTargetRecords = buildStudentTargetRecords(studentId, targets);
    const proposedTargetState = [
      ...studentTargets.filter((target) => target.studentId !== studentId),
      ...proposedTargetRecords,
    ];

    const incompatibleClasses = classStudents
      .filter(
        (relation) =>
          relation.studentId === studentId && relation.status === "ACTIVE",
      )
      .map((relation) => classes.find((item) => item.id === relation.classId))
      .filter(
        (classItem) =>
          classItem && assignableClassStatuses.includes(classItem.status),
      )
      .map((classItem) => ({
        classItem,
        eligibility: evaluateStudentClassTarget({
          student: proposedStudent,
          classItem,
          studentTargets: proposedTargetState,
          classTargetRequirements,
        }),
      }))
      .filter(({ eligibility }) => !eligibility.eligible);

    if (incompatibleClasses.length) {
      const first = incompatibleClasses[0];
      return {
        ok: false,
        code: "ACTIVE_CLASS_TARGET_CONFLICT",
        reason:
          `Target changes would make this student ineligible for active class ${first.classItem.classCode}. Remove the student from that class first or keep a compatible target.`,
        conflicts: incompatibleClasses,
      };
    }

    setStudents((current) =>
      current.map((student) =>
        student.id === studentId
          ? {
              ...student,
              ...studentForm,
              studentCode: normalizedStudentCode,
              fullName: normalizedFullName,
              email: studentForm.email?.trim() ?? "",
              phone: studentForm.phone?.trim() ?? "",
            }
          : student,
      ),
    );
    syncStudentTargets(studentId, targets);
    addAudit(actor, "UPDATE_STUDENT", "STUDENT", studentId, {
      studentCode: normalizedStudentCode,
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
    setStudentTargets((current) =>
      current.filter((target) => target.studentId !== studentId),
    );
    addAudit(actor, "DELETE_STUDENT", "STUDENT", studentId);
    return { ok: true };
  }

  function changeStudentStatus(studentId, nextStatus, actor) {
    if (actor.role !== "ADMIN") {
      return {
        ok: false,
        reason: "Only Admin can change student status.",
      };
    }

    const student = students.find((item) => item.id === studentId);
    if (!student) return { ok: false, reason: "Student not found." };

    const allowed = studentStatusTransitions[student.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      return {
        ok: false,
        reason: `Cannot change student status from ${student.status} to ${nextStatus}.`,
      };
    }

    setStudents((current) =>
      current.map((item) =>
        item.id === studentId ? { ...item, status: nextStatus } : item,
      ),
    );

    const deactivatedClassIds =
      nextStatus === "Active"
        ? []
        : classStudents
            .filter(
              (relation) =>
                relation.studentId === studentId &&
                relation.status === "ACTIVE",
            )
            .map((relation) => relation.classId);

    if (deactivatedClassIds.length) {
      setClassStudents((current) =>
        current.map((relation) =>
          relation.studentId === studentId &&
          relation.status === "ACTIVE"
            ? {
                ...relation,
                status: "INACTIVE",
                inactiveReason: `STUDENT_${nextStatus.toUpperCase().replaceAll(" ", "_")}`,
              }
            : relation,
        ),
      );
    }

    addAudit(actor, "CHANGE_STUDENT_STATUS", "STUDENT", studentId, {
      from: student.status,
      to: nextStatus,
      deactivatedClassIds,
    });

    deactivatedClassIds.forEach((classId) => {
      addAudit(actor, "DEACTIVATE_STUDENT_MEMBERSHIP", "CLASS", classId, {
        studentId,
        reason: `STUDENT_${nextStatus.toUpperCase().replaceAll(" ", "_")}`,
      });
    });

    return { ok: true, deactivatedClassIds };
  }

  function getStudentClassEligibility(studentId, classId) {
    const student = students.find((item) => item.id === studentId);
    const classItem = classes.find((item) => item.id === classId);

    return evaluateStudentClassTarget({
      student,
      classItem,
      studentTargets,
      classTargetRequirements,
    });
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

    const candidateIds = [...new Set(studentIds)].filter(
      (studentId) => !activeIds.has(studentId),
    );

    if (!candidateIds.length) {
      return {
        ok: false,
        reason: "Selected students are already active in this class.",
      };
    }

    const eligibilityResults = candidateIds.map((studentId) => ({
      studentId,
      ...getStudentClassEligibility(studentId, classId),
    }));
    const blocked = eligibilityResults.filter((result) => !result.eligible);

    if (blocked.length) {
      return {
        ok: false,
        code: blocked[0].code ?? "TARGET_MISMATCH",
        reason:
          blocked.length === 1
            ? blocked[0].reasons?.[0] ??
              "The selected student is not eligible for this class."
            : "One or more selected students are not eligible for this class. Review the target and status checks.",
        blocked,
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
            inactiveReason: null,
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

    const classItem = classes.find((item) => item.id === classId);
    if (!classItem) return { ok: false, reason: "Class not found." };

    if (!assignableClassStatuses.includes(classItem.status)) {
      return {
        ok: false,
        reason: `Cannot change the roster of a ${classItem.status.toLowerCase()} class.`,
      };
    }

    const activeRelation = classStudents.find(
      (relation) =>
        relation.studentId === studentId &&
        relation.classId === classId &&
        relation.status === "ACTIVE",
    );

    if (!activeRelation) {
      return {
        ok: false,
        reason: "Student is not currently active in this class.",
      };
    }

    setClassStudents((current) =>
      current.map((relation) =>
        relation.id === activeRelation.id
          ? {
              ...relation,
              status: "INACTIVE",
              inactiveReason: "REMOVED_FROM_CLASS",
            }
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

    const normalizedClassCode = form.classCode?.trim();
    const normalizedClassName = form.name?.trim();

    if (!normalizedClassCode || !normalizedClassName) {
      return { ok: false, reason: "Class code and class name are required." };
    }

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.startDate) > new Date(form.endDate)
    ) {
      return {
        ok: false,
        reason: "Class end date must be on or after the start date.",
      };
    }

    const duplicate = classes.some(
      (classItem) =>
        classItem.classCode.trim().toLowerCase() ===
        normalizedClassCode.toLowerCase(),
    );
    if (duplicate) return { ok: false, reason: "Class code already exists." };

    const { requiredTargets, ...classForm } = form;
    classForm.classCode = normalizedClassCode;
    classForm.name = normalizedClassName;

    const classTargetValidation = validateCourseTargetValues(
      classForm.courseId,
      requiredTargets?.[classForm.courseId] ?? {},
      { required: true },
    );
    if (!classTargetValidation.ok) return classTargetValidation;

    const classItem = {
      ...classForm,
      status: "DRAFT",
      id: `class-${Date.now()}`,
      createdBy: actor.id,
    };
    setClasses((current) => [classItem, ...current]);
    syncClassTargetRequirements(
      classItem.id,
      classItem.courseId,
      requiredTargets,
    );

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

    const currentClass = classes.find((item) => item.id === classId);
    if (!currentClass) return { ok: false, reason: "Class not found." };

    if (currentClass.status === "CLOSED") {
      return {
        ok: false,
        code: "CLASS_READ_ONLY",
        reason: "Closed classes are archived and read-only.",
      };
    }

    const normalizedClassCode = form.classCode?.trim();
    const normalizedClassName = form.name?.trim();

    if (!normalizedClassCode || !normalizedClassName) {
      return { ok: false, reason: "Class code and class name are required." };
    }

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.startDate) > new Date(form.endDate)
    ) {
      return {
        ok: false,
        reason: "Class end date must be on or after the start date.",
      };
    }

    const duplicate = classes.some(
      (classItem) =>
        classItem.id !== classId &&
        classItem.classCode.trim().toLowerCase() ===
          normalizedClassCode.toLowerCase(),
    );
    if (duplicate) return { ok: false, reason: "Class code already exists." };

    const { requiredTargets, ...classForm } = form;
    classForm.classCode = normalizedClassCode;
    classForm.name = normalizedClassName;

    const classHasHistory =
      classStudents.some((relation) => relation.classId === classId) ||
      teachingSchedules.some((schedule) => schedule.classId === classId) ||
      assignments.some((assignment) => assignment.classId === classId) ||
      exams.some((exam) => exam.classId === classId) ||
      studentResults.some((result) => result.classId === classId);

    if (classForm.courseId !== currentClass.courseId && classHasHistory) {
      return {
        ok: false,
        code: "CLASS_COURSE_LOCKED",
        reason:
          "Course cannot be changed after the class has roster, schedule, teaching activity or academic history.",
      };
    }

    const classTargetValidation = validateCourseTargetValues(
      classForm.courseId,
      requiredTargets?.[classForm.courseId] ?? {},
      { required: true },
    );
    if (!classTargetValidation.ok) return classTargetValidation;

    const proposedClass = {
      ...currentClass,
      ...classForm,
      status: currentClass.status,
    };
    const proposedRequirements = buildClassTargetRequirementRecords(
      classId,
      classForm.courseId,
      requiredTargets,
    );

    const currentRequirementSignature = classTargetRequirements
      .filter((requirement) => requirement.classId === classId)
      .map((requirement) => [
        requirement.targetType,
        Number(requirement.requiredTarget),
      ])
      .sort(([a], [b]) => a.localeCompare(b));
    const proposedRequirementSignature = proposedRequirements
      .map((requirement) => [
        requirement.targetType,
        Number(requirement.requiredTarget),
      ])
      .sort(([a], [b]) => a.localeCompare(b));

    if (
      ["RUNNING", "COMPLETED", "CLOSED"].includes(currentClass.status) &&
      JSON.stringify(currentRequirementSignature) !==
        JSON.stringify(proposedRequirementSignature)
    ) {
      return {
        ok: false,
        code: "CLASS_TARGET_LOCKED",
        reason:
          "Class target requirements are locked once the class is running to preserve placement history.",
      };
    }

    const proposedRequirementState = [
      ...classTargetRequirements.filter(
        (requirement) => requirement.classId !== classId,
      ),
      ...proposedRequirements,
    ];

    const incompatibleStudents = classStudents
      .filter(
        (relation) =>
          relation.classId === classId && relation.status === "ACTIVE",
      )
      .map((relation) => students.find((student) => student.id === relation.studentId))
      .filter(Boolean)
      .map((student) => ({
        student,
        eligibility: evaluateStudentClassTarget({
          student,
          classItem: proposedClass,
          studentTargets,
          classTargetRequirements: proposedRequirementState,
        }),
      }))
      .filter(({ eligibility }) => !eligibility.eligible);

    if (
      assignableClassStatuses.includes(currentClass.status) &&
      incompatibleStudents.length
    ) {
      const first = incompatibleStudents[0];
      return {
        ok: false,
        code: "CLASS_TARGET_ROSTER_CONFLICT",
        reason:
          `The new class target would make ${first.student.fullName} and possibly other active students ineligible. Adjust the threshold or roster first.`,
        conflicts: incompatibleStudents,
      };
    }

    setClasses((current) =>
      current.map((classItem) =>
        classItem.id === classId
          ? { ...classItem, ...classForm, status: classItem.status }
          : classItem,
      ),
    );
    syncClassTargetRequirements(
      classId,
      classForm.courseId,
      requiredTargets,
    );
    addAudit(actor, "UPDATE_CLASS", "CLASS", classId, {
      classCode: classForm.classCode,
      name: classForm.name,
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

    if (["READY", "RUNNING"].includes(nextStatus)) {
      const requirementObject = Object.fromEntries(
        classTargetRequirements
          .filter((requirement) => requirement.classId === classId)
          .map((requirement) => [
            requirement.targetType,
            requirement.requiredTarget,
          ]),
      );
      const targetValidation = validateCourseTargetValues(
        classItem.courseId,
        requirementObject,
        { required: true },
      );
      if (!targetValidation.ok) {
        return {
          ok: false,
          reason:
            "Class target requirements must be complete and valid before the class can become Ready or Running.",
        };
      }
    }

    if (nextStatus === "RUNNING") {
      const validTeachingSchedules = teachingSchedules.filter(
        (schedule) =>
          schedule.classId === classId &&
          isValidAssignedTeachingSchedule(schedule, classItem),
      );

      if (!validTeachingSchedules.length) {
        return {
          ok: false,
          code: "TEACHING_SCHEDULE_REQUIRED",
          reason:
            "A class cannot start running until TC has assigned at least one valid teaching schedule and teacher.",
        };
      }
    }

    if (nextStatus === "COMPLETED") {
      const hasOpenAssignment = assignments.some(
        (assignment) =>
          assignment.classId === classId && assignment.status === "OPEN",
      );
      const hasScheduledExam = exams.some(
        (exam) => exam.classId === classId && exam.status === "SCHEDULED",
      );

      if (hasOpenAssignment || hasScheduledExam) {
        return {
          ok: false,
          code: "TEACHING_ACTIVITY_PENDING",
          reason:
            "Close or cancel open assignments and complete or cancel scheduled exams before completing the class.",
        };
      }
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

    const supportClass = classes.find((item) => item.id === schedule.classId);
    if (supportClass?.status === "CLOSED") {
      return {
        ok: false,
        code: "CLASS_READ_ONLY",
        reason: "Closed classes are archived and read-only.",
      };
    }

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

  function validateTeacherActivityAccess(actor, classId) {
    if (!isTeacherAssigned(actor, classId)) {
      return {
        ok: false,
        reason: "Teacher can only manage teaching activities for assigned classes.",
      };
    }

    const classItem = classes.find((item) => item.id === classId);
    if (!classItem) return { ok: false, reason: "Class not found." };

    if (!teachingActivityClassStatuses.includes(classItem.status)) {
      return {
        ok: false,
        code: "CLASS_NOT_TEACHABLE",
        reason:
          "Assignments and exams can only be created or edited while the class is Ready or Running.",
      };
    }

    return { ok: true, classItem };
  }

  function addAssignment(data, actor) {
    const access = validateTeacherActivityAccess(actor, data.classId);
    if (!access.ok) return access;

    const title = data.title?.trim();
    if (!title || !data.deadline) {
      return {
        ok: false,
        reason: "Assignment title and deadline are required.",
      };
    }

    if (
      (access.classItem.startDate && data.deadline < access.classItem.startDate) ||
      (access.classItem.endDate && data.deadline > access.classItem.endDate)
    ) {
      return {
        ok: false,
        reason: "Assignment deadline must be within the class date range.",
      };
    }

    const assignment = {
      ...data,
      title,
      description: data.description?.trim() ?? "",
      id: `assignment-${Date.now()}`,
      teacherId: actor.id,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };
    setAssignments((current) => [assignment, ...current]);
    addAudit(actor, "CREATE_ASSIGNMENT", "CLASS", assignment.classId, {
      assignmentId: assignment.id,
    });
    return { ok: true, assignment };
  }

  function updateAssignment(assignmentId, data, actor) {
    const assignment = assignments.find((item) => item.id === assignmentId);
    if (!assignment) return { ok: false, reason: "Assignment not found." };

    const access = validateTeacherActivityAccess(actor, assignment.classId);
    if (!access.ok) return access;

    if (assignment.teacherId !== actor.id) {
      return {
        ok: false,
        reason: "Teacher can only edit assignments they created.",
      };
    }

    if (assignment.status !== "OPEN") {
      return {
        ok: false,
        reason: "Only open assignments can be edited.",
      };
    }

    if (
      studentResults.some((result) => result.assignmentId === assignmentId)
    ) {
      return {
        ok: false,
        code: "ASSIGNMENT_HAS_RESULTS",
        reason:
          "Assignment details are locked after student results have been recorded.",
      };
    }

    const title = data.title?.trim();
    if (!title || !data.deadline) {
      return {
        ok: false,
        reason: "Assignment title and deadline are required.",
      };
    }

    if (
      (access.classItem.startDate && data.deadline < access.classItem.startDate) ||
      (access.classItem.endDate && data.deadline > access.classItem.endDate)
    ) {
      return {
        ok: false,
        reason: "Assignment deadline must be within the class date range.",
      };
    }

    setAssignments((current) =>
      current.map((item) =>
        item.id === assignmentId
          ? {
              ...item,
              title,
              description: data.description?.trim() ?? "",
              deadline: data.deadline,
            }
          : item,
      ),
    );
    addAudit(actor, "UPDATE_ASSIGNMENT", "CLASS", assignment.classId, {
      assignmentId,
    });
    return { ok: true };
  }

  function changeAssignmentStatus(assignmentId, nextStatus, actor) {
    const assignment = assignments.find((item) => item.id === assignmentId);
    if (!assignment) return { ok: false, reason: "Assignment not found." };

    if (!isTeacherAssigned(actor, assignment.classId)) {
      return {
        ok: false,
        reason: "Teacher can only manage assignments for assigned classes.",
      };
    }

    const classItem = classes.find((item) => item.id === assignment.classId);
    if (!classItem || classItem.status === "CLOSED") {
      return {
        ok: false,
        reason: "Closed classes are read-only.",
      };
    }

    if (
      assignment.status !== "OPEN" ||
      !["CLOSED", "CANCELLED"].includes(nextStatus)
    ) {
      return {
        ok: false,
        reason: "Invalid assignment status transition.",
      };
    }

    if (
      nextStatus === "CANCELLED" &&
      studentResults.some((result) => result.assignmentId === assignmentId)
    ) {
      return {
        ok: false,
        reason: "An assignment with recorded results cannot be cancelled.",
      };
    }

    setAssignments((current) =>
      current.map((item) =>
        item.id === assignmentId ? { ...item, status: nextStatus } : item,
      ),
    );
    addAudit(actor, "CHANGE_ASSIGNMENT_STATUS", "CLASS", assignment.classId, {
      assignmentId,
      from: assignment.status,
      to: nextStatus,
    });
    return { ok: true };
  }

  function addExam(data, actor) {
    const access = validateTeacherActivityAccess(actor, data.classId);
    if (!access.ok) return access;

    const title = data.title?.trim();
    const duration = Number(data.duration);
    if (!title || !data.examDate || !Number.isFinite(duration) || duration <= 0) {
      return {
        ok: false,
        reason: "Exam title, date and a positive duration are required.",
      };
    }

    if (
      (access.classItem.startDate && data.examDate < access.classItem.startDate) ||
      (access.classItem.endDate && data.examDate > access.classItem.endDate)
    ) {
      return {
        ok: false,
        reason: "Exam date must be within the class date range.",
      };
    }

    const exam = {
      ...data,
      title,
      description: data.description?.trim() ?? "",
      duration,
      id: `exam-${Date.now()}`,
      teacherId: actor.id,
      status: "SCHEDULED",
    };
    setExams((current) => [exam, ...current]);
    addAudit(actor, "CREATE_EXAM", "CLASS", exam.classId, { examId: exam.id });
    return { ok: true, exam };
  }

  function updateExam(examId, data, actor) {
    const exam = exams.find((item) => item.id === examId);
    if (!exam) return { ok: false, reason: "Exam not found." };

    const access = validateTeacherActivityAccess(actor, exam.classId);
    if (!access.ok) return access;

    if (exam.teacherId !== actor.id) {
      return {
        ok: false,
        reason: "Teacher can only edit exams they created.",
      };
    }

    if (exam.status !== "SCHEDULED") {
      return {
        ok: false,
        reason: "Only scheduled exams can be edited.",
      };
    }

    if (studentResults.some((result) => result.examId === examId)) {
      return {
        ok: false,
        code: "EXAM_HAS_RESULTS",
        reason:
          "Exam details are locked after student results have been recorded.",
      };
    }

    const title = data.title?.trim();
    const duration = Number(data.duration);
    if (!title || !data.examDate || !Number.isFinite(duration) || duration <= 0) {
      return {
        ok: false,
        reason: "Exam title, date and a positive duration are required.",
      };
    }

    if (
      (access.classItem.startDate && data.examDate < access.classItem.startDate) ||
      (access.classItem.endDate && data.examDate > access.classItem.endDate)
    ) {
      return {
        ok: false,
        reason: "Exam date must be within the class date range.",
      };
    }

    setExams((current) =>
      current.map((item) =>
        item.id === examId
          ? {
              ...item,
              title,
              description: data.description?.trim() ?? "",
              examDate: data.examDate,
              duration,
            }
          : item,
      ),
    );
    addAudit(actor, "UPDATE_EXAM", "CLASS", exam.classId, { examId });
    return { ok: true };
  }

  function changeExamStatus(examId, nextStatus, actor) {
    const exam = exams.find((item) => item.id === examId);
    if (!exam) return { ok: false, reason: "Exam not found." };

    if (!isTeacherAssigned(actor, exam.classId)) {
      return {
        ok: false,
        reason: "Teacher can only manage exams for assigned classes.",
      };
    }

    const classItem = classes.find((item) => item.id === exam.classId);
    if (!classItem || classItem.status === "CLOSED") {
      return { ok: false, reason: "Closed classes are read-only." };
    }

    if (
      exam.status !== "SCHEDULED" ||
      !["COMPLETED", "CANCELLED"].includes(nextStatus)
    ) {
      return {
        ok: false,
        reason: "Invalid exam status transition.",
      };
    }

    if (
      nextStatus === "CANCELLED" &&
      studentResults.some((result) => result.examId === examId)
    ) {
      return {
        ok: false,
        reason: "An exam with recorded results cannot be cancelled.",
      };
    }

    setExams((current) =>
      current.map((item) =>
        item.id === examId ? { ...item, status: nextStatus } : item,
      ),
    );
    addAudit(actor, "CHANGE_EXAM_STATUS", "CLASS", exam.classId, {
      examId,
      from: exam.status,
      to: nextStatus,
    });
    return { ok: true };
  }

  function upsertStudentResult(data, actor) {
    if (!isTeacherAssigned(actor, data.classId)) {
      return {
        ok: false,
        reason: "Teacher can only evaluate students in assigned classes.",
      };
    }

    const classItem = classes.find((item) => item.id === data.classId);
    if (!classItem) return { ok: false, reason: "Class not found." };

    if (!gradingClassStatuses.includes(classItem.status)) {
      return {
        ok: false,
        code: "CLASS_NOT_GRADABLE",
        reason:
          "Results can only be recorded while a class is Ready, Running or Completed.",
      };
    }

    const hasAssignment = Boolean(data.assignmentId);
    const hasExam = Boolean(data.examId);
    if (hasAssignment === hasExam) {
      return {
        ok: false,
        code: "INVALID_RESULT_ACTIVITY",
        reason:
          "A student result must reference exactly one assignment or one exam.",
      };
    }

    if (hasAssignment) {
      const assignment = assignments.find(
        (item) => item.id === data.assignmentId,
      );
      if (!assignment || assignment.classId !== data.classId) {
        return {
          ok: false,
          code: "RESULT_ACTIVITY_CLASS_MISMATCH",
          reason: "The selected assignment does not belong to this class.",
        };
      }
      if (assignment.teacherId !== actor.id) {
        return {
          ok: false,
          code: "RESULT_ACTIVITY_NOT_OWNED",
          reason: "Teacher can only grade assignments they created.",
        };
      }
      if (assignment.status === "CANCELLED") {
        return {
          ok: false,
          reason: "Results cannot be recorded for a cancelled assignment.",
        };
      }
    }

    if (hasExam) {
      const exam = exams.find((item) => item.id === data.examId);
      if (!exam || exam.classId !== data.classId) {
        return {
          ok: false,
          code: "RESULT_ACTIVITY_CLASS_MISMATCH",
          reason: "The selected exam does not belong to this class.",
        };
      }
      if (exam.teacherId !== actor.id) {
        return {
          ok: false,
          code: "RESULT_ACTIVITY_NOT_OWNED",
          reason: "Teacher can only grade exams they created.",
        };
      }
      if (exam.status !== "COMPLETED") {
        return {
          ok: false,
          reason: "Mark the exam as completed before recording results.",
        };
      }
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

    const score = String(data.score ?? "").trim();
    if (!score) {
      return { ok: false, reason: "Score is required." };
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
                score,
                feedback: data.feedback?.trim() ?? "",
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
          score,
          feedback: data.feedback?.trim() ?? "",
          evaluatedBy: actor.id,
          evaluatedAt: new Date().toISOString(),
        },
        ...current,
      ]);
    }

    addAudit(actor, "EVALUATE_STUDENT", "CLASS", data.classId, {
      studentId: data.studentId,
      assignmentId: data.assignmentId ?? null,
      examId: data.examId ?? null,
    });
    return { ok: true };
  }

  const value = useMemo(
    () => ({
      students,
      classes,
      classStudents,
      studentTargets,
      classTargetRequirements,
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
      changeStudentStatus,
      getStudentClassEligibility,
      assignStudentsToClass,
      removeStudentFromClass,
      addClass,
      updateClass,
      advanceClassStatus,
      overrideSupport,
      addAssignment,
      updateAssignment,
      changeAssignmentStatus,
      addExam,
      updateExam,
      changeExamStatus,
      upsertStudentResult,
    }),
    [
      students,
      classes,
      classStudents,
      studentTargets,
      classTargetRequirements,
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
