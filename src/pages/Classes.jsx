import { useMemo, useState } from "react";
import ClassesView from "../features/classes/ClassesView";
import ClassFormModal from "../features/classes/ClassFormModal";
import SupportOverrideModal from "../features/classes/SupportOverrideModal";
import AddClassStudentsModal from "../features/classes/AddClassStudentsModal";
import TeachingActivityModal from "../features/classes/TeachingActivityModal";
import StudentResultModal from "../features/classes/StudentResultModal";
import {
  emptyClassForm,
  PAGE_SIZE,
  courses,
  classStatuses,
} from "../features/classes/mockClasses";
import {
  demoTeacherId,
  getTeacherName,
} from "../features/academic/mockAcademicRelations";
import {
  getCsName,
} from "../features/classes/mockClassOperations";
import { useAcademicData } from "../features/academic/AcademicDataContext";
import { assignableClassStatuses } from "../features/academic/targetEligibility";

const actors = {
  ADMIN: { id: "admin-001", fullName: "System Admin", role: "ADMIN" },
  CS: { id: "cs-001", fullName: "Current CS", role: "CS" },
  TEACHER: { id: demoTeacherId, fullName: "David Miller", role: "TEACHER" },
};

export default function Classes({ role }) {
  const roleKey = role?.key ?? "ADMIN";
  const actor =
    actors[roleKey] ?? { id: "staff-demo", fullName: roleKey, role: roleKey };
  const isAdmin = roleKey === "ADMIN";
  const isCs = roleKey === "CS";
  const isTeacher = roleKey === "TEACHER";
  const canManageCore = isAdmin || isCs;
  const canManageStudents = isAdmin || isCs;
  const canTeach = isTeacher;

  const {
    students,
    classes,
    classStudents,
    classTargetRequirements,
    classAccessScopes,
    teachingSchedules,
    staffSchedules,
    assignments,
    exams,
    studentResults,
    auditLogs,
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
  } = useAcademicData();

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("Overview");
  const [editing, setEditing] = useState(undefined);
  const [overrideSchedule, setOverrideSchedule] = useState(null);
  const [addingStudents, setAddingStudents] = useState(false);
  const [activityType, setActivityType] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [grading, setGrading] = useState(false);
  const [message, setMessage] = useState("");

  const scopedClasses = useMemo(() => {
    if (isAdmin) return classes;

    if (isTeacher) {
      const assignedIds = new Set(
        teachingSchedules
          .filter(
            (schedule) =>
              schedule.teacherId === actor.id && schedule.status === "ASSIGNED",
          )
          .map((schedule) => schedule.classId),
      );
      return classes.filter((classItem) => assignedIds.has(classItem.id));
    }

    if (isCs) {
      const allowedClassIds = new Set(
        classAccessScopes
          .filter(
            (scope) =>
              scope.role === "CS" &&
              scope.userId === actor.id &&
              scope.status === "ACTIVE",
          )
          .map((scope) => scope.classId),
      );

      return classes.filter((classItem) => allowedClassIds.has(classItem.id));
    }

    return [];
  }, [
    classes,
    teachingSchedules,
    staffSchedules,
    classAccessScopes,
    isAdmin,
    isTeacher,
    isCs,
    actor.id,
  ]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return scopedClasses.filter((classItem) => {
      const teacherNames = teachingSchedules
        .filter(
          (schedule) =>
            schedule.classId === classItem.id &&
            schedule.status === "ASSIGNED",
        )
        .map((schedule) => getTeacherName(schedule.teacherId))
        .join(" ");
      const searchable =
        `${classItem.classCode} ${classItem.name} ${teacherNames}`.toLowerCase();

      return (
        searchable.includes(keyword) &&
        (course === "ALL" || classItem.courseId === course) &&
        (status === "ALL" || classItem.status === status)
      );
    });
  }, [scopedClasses, search, course, status, teachingSchedules]);

  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected =
    scopedClasses.find((classItem) => classItem.id === selectedId) ?? null;
  const canModifySelectedRoster =
    canManageStudents &&
    selected &&
    assignableClassStatuses.includes(selected.status);

  const selectedClassStudents = selected
    ? classStudents.filter(
        (relation) =>
          relation.classId === selected.id && relation.status === "ACTIVE",
      )
    : [];
  const selectedStudents = selectedClassStudents
    .map((relation) => students.find((student) => student.id === relation.studentId))
    .filter(Boolean);

  const selectedTeachingSchedules = selected
    ? teachingSchedules.filter(
        (schedule) =>
          schedule.classId === selected.id &&
          schedule.status === "ASSIGNED" &&
          (!isTeacher || schedule.teacherId === actor.id),
      )
    : [];

  const selectedSupportSchedules = selected
    ? staffSchedules.filter(
        (schedule) =>
          schedule.classId === selected.id &&
          schedule.staffRole === "CS" &&
          schedule.status === "ASSIGNED" &&
          (isAdmin || (isCs && schedule.userId === actor.id)),
      )
    : [];

  const selectedAssignments = selected
    ? assignments.filter((item) => item.classId === selected.id)
    : [];
  const selectedExams = selected
    ? exams.filter((item) => item.classId === selected.id)
    : [];
  const selectedResults = selected
    ? studentResults.filter((item) => item.classId === selected.id)
    : [];
  const selectedAuditLogs = selected
    ? auditLogs.filter(
        (log) => log.entityType === "CLASS" && log.entityId === selected.id,
      )
    : [];

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function exportCsv() {
    const csv = [
      [
        "Class Code",
        "Class Name",
        "Course",
        "Teacher",
        "Students",
        "Start Date",
        "End Date",
        "Status",
      ],
      ...filtered.map((classItem) => {
        const teachers = [
          ...new Set(
            teachingSchedules
              .filter(
                (schedule) =>
                  schedule.classId === classItem.id &&
                  schedule.status === "ASSIGNED",
              )
              .map((schedule) => getTeacherName(schedule.teacherId)),
          ),
        ].join("; ");
        const studentCount = classStudents.filter(
          (relation) =>
            relation.classId === classItem.id && relation.status === "ACTIVE",
        ).length;

        return [
          classItem.classCode,
          classItem.name,
          courses.find((item) => item.id === classItem.courseId)?.name ?? "",
          teachers,
          studentCount,
          classItem.startDate,
          classItem.endDate,
          classItem.status,
        ];
      }),
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "classes.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function saveClass(form) {
    const result = editing
      ? updateClass(editing.id, form, actor)
      : addClass(form, actor);

    if (!result.ok) {
      setMessage(result.reason);
      return;
    }

    setSelectedId(editing?.id ?? result.classItem.id);
    setEditing(undefined);
    setTab("Overview");
    setMessage("");
  }

  function advanceStatus(nextStatus) {
    if (!selected || !canManageCore) return;
    const result = advanceClassStatus(selected.id, nextStatus, actor);
    if (!result.ok) {
      setMessage(result.reason);
      return;
    }
    setMessage("");
  }

  function confirmSupportOverride({
    scheduleId,
    newCsId,
    reason,
    allowConflict,
  }) {
    if (!isAdmin) return;
    const result = overrideSupport(
      scheduleId,
      newCsId,
      reason,
      actor,
      allowConflict,
    );
    if (!result.ok) {
      setMessage(result.reason);
      return;
    }
    setOverrideSchedule(null);
    setMessage("");
  }

  function addStudents(ids) {
    if (!selected || !canManageStudents) return;
    const result = assignStudentsToClass(ids, selected.id, actor);
    if (!result.ok) {
      setMessage(result.reason);
      return;
    }
    setAddingStudents(false);
    setMessage(`${result.added} student(s) added to ${selected.classCode}.`);
  }

  function removeStudent(studentId) {
    if (!selected || !canManageStudents) return;
    const result = removeStudentFromClass(studentId, selected.id, actor);
    if (!result?.ok) {
      setMessage(result?.reason ?? "Unable to remove student from class.");
      return;
    }
    setMessage("Student removed from the active roster. Membership history was preserved.");
  }

  function saveActivity(data) {
    if (!canTeach || !selected) return;

    let result;
    if (editingActivity?.kind === "assignment") {
      result = updateAssignment(editingActivity.item.id, data, actor);
    } else if (editingActivity?.kind === "exam") {
      result = updateExam(editingActivity.item.id, data, actor);
    } else {
      result =
        activityType === "exam" ? addExam(data, actor) : addAssignment(data, actor);
    }

    if (result?.ok === false) {
      setMessage(result.reason);
      return;
    }

    const kind = editingActivity?.kind ?? activityType;
    const wasEditing = Boolean(editingActivity);
    setActivityType(null);
    setEditingActivity(null);
    setMessage(
      `${kind === "exam" ? "Exam" : "Assignment"} ${wasEditing ? "updated" : "created"}.`,
    );
  }

  function editAssignment(item) {
    if (!canTeach) return;
    setEditingActivity({ kind: "assignment", item });
    setActivityType("assignment");
    setMessage("");
  }

  function editExam(item) {
    if (!canTeach) return;
    setEditingActivity({ kind: "exam", item });
    setActivityType("exam");
    setMessage("");
  }

  function setAssignmentStatus(item, nextStatus) {
    if (!canTeach) return;
    const result = changeAssignmentStatus(item.id, nextStatus, actor);
    if (!result.ok) {
      setMessage(result.reason);
      return;
    }
    setMessage(`Assignment marked ${nextStatus.toLowerCase()}.`);
  }

  function setExamStatus(item, nextStatus) {
    if (!canTeach) return;
    const result = changeExamStatus(item.id, nextStatus, actor);
    if (!result.ok) {
      setMessage(result.reason);
      return;
    }
    setMessage(`Exam marked ${nextStatus.toLowerCase()}.`);
  }

  function saveResult(data) {
    if (!canTeach) return;
    const result = upsertStudentResult(data, actor);
    if (result?.ok === false) {
      setMessage(result.reason);
      return;
    }
    setGrading(false);
    setMessage("Student result and feedback saved.");
  }

  function studentCount(classId) {
    return classStudents.filter(
      (relation) =>
        relation.classId === classId && relation.status === "ACTIVE",
    ).length;
  }

  function teacherSummary(classId) {
    return [
      ...new Set(
        teachingSchedules
          .filter(
            (schedule) =>
              schedule.classId === classId &&
              schedule.status === "ASSIGNED",
          )
          .map((schedule) => getTeacherName(schedule.teacherId)),
      ),
    ];
  }

  function supportSummary(classId) {
    return [
      ...new Set(
        staffSchedules
          .filter(
            (schedule) =>
              schedule.classId === classId &&
              schedule.staffRole === "CS" &&
              schedule.status === "ASSIGNED",
          )
          .map((schedule) => getCsName(schedule.userId)),
      ),
    ];
  }

  return (
    <>
      <ClassesView
        roleKey={roleKey}
        canManageCore={canManageCore}
        canManageStudents={canManageStudents}
        canTeach={canTeach}
        search={search}
        onSearch={(value) => changeFilter(setSearch, value)}
        course={course}
        onCourse={(value) => changeFilter(setCourse, value)}
        status={status}
        onStatus={(value) => changeFilter(setStatus, value)}
        onExport={exportCsv}
        onCreate={canManageCore ? () => setEditing(null) : undefined}
        visible={visible}
        onSelect={(id) => {
          setSelectedId(id);
          setTab("Overview");
          setMessage("");
        }}
        filteredCount={filtered.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPage={setPage}
        selected={selected}
        selectedId={selectedId}
        tab={tab}
        setTab={setTab}
        onCloseDetail={() => setSelectedId(null)}
        onEdit={
          canManageCore && selected && selected.status !== "CLOSED"
            ? () => {
                const requiredTargets = classTargetRequirements
                  .filter(
                    (requirement) => requirement.classId === selected.id,
                  )
                  .reduce((result, requirement) => {
                    result[selected.courseId] = {
                      ...(result[selected.courseId] ?? {}),
                      [requirement.targetType]: requirement.requiredTarget,
                    };
                    return result;
                  }, {});

                setEditing({
                  ...selected,
                  requiredTargets,
                });
              }
            : undefined
        }
        onAdvanceStatus={
          canManageCore && selected?.status !== "CLOSED"
            ? advanceStatus
            : undefined
        }
        students={selectedStudents}
        onAddStudents={
          canModifySelectedRoster ? () => setAddingStudents(true) : undefined
        }
        onRemoveStudent={canModifySelectedRoster ? removeStudent : undefined}
        teachingSchedules={selectedTeachingSchedules}
        teacherSummary={teacherSummary}
        studentCount={studentCount}
        supportSchedules={selectedSupportSchedules}
        supportSummary={supportSummary}
        onOverrideSupport={
          isAdmin && selected?.status !== "CLOSED"
            ? setOverrideSchedule
            : undefined
        }
        assignments={selectedAssignments}
        exams={selectedExams}
        onCreateAssignment={
          canTeach && selected && ["READY", "RUNNING"].includes(selected.status)
            ? () => {
                setEditingActivity(null);
                setActivityType("assignment");
              }
            : undefined
        }
        onCreateExam={
          canTeach && selected && ["READY", "RUNNING"].includes(selected.status)
            ? () => {
                setEditingActivity(null);
                setActivityType("exam");
              }
            : undefined
        }
        teacherActorId={isTeacher ? actor.id : undefined}
        onEditAssignment={
          canTeach && selected && ["READY", "RUNNING"].includes(selected.status)
            ? editAssignment
            : undefined
        }
        onAssignmentStatus={
          canTeach && selected && ["READY", "RUNNING"].includes(selected.status)
            ? setAssignmentStatus
            : undefined
        }
        onEditExam={
          canTeach && selected && ["READY", "RUNNING"].includes(selected.status)
            ? editExam
            : undefined
        }
        onExamStatus={
          canTeach && selected && ["READY", "RUNNING"].includes(selected.status)
            ? setExamStatus
            : undefined
        }
        results={selectedResults}
        onRecordResult={
          canTeach &&
          selected &&
          ["READY", "RUNNING", "COMPLETED"].includes(selected.status)
            ? () => setGrading(true)
            : undefined
        }
        auditLogs={selectedAuditLogs}
        message={message}
      />

      {editing !== undefined && (
        <ClassFormModal
          classItem={editing}
          emptyForm={emptyClassForm}
          onClose={() => setEditing(undefined)}
          onSave={saveClass}
        />
      )}

      {overrideSchedule && isAdmin && (
        <SupportOverrideModal
          schedule={overrideSchedule}
          staffSchedules={staffSchedules}
          onClose={() => setOverrideSchedule(null)}
          onConfirm={confirmSupportOverride}
        />
      )}

      {addingStudents && selected && (
        <AddClassStudentsModal
          classItem={selected}
          students={students}
          classStudents={classStudents}
          getEligibility={getStudentClassEligibility}
          onClose={() => setAddingStudents(false)}
          onAdd={addStudents}
        />
      )}

      {activityType && selected && (
        <TeachingActivityModal
          classItem={selected}
          type={activityType}
          activity={editingActivity?.item}
          onClose={() => {
            setActivityType(null);
            setEditingActivity(null);
          }}
          onSave={saveActivity}
        />
      )}

      {grading && selected && (
        <StudentResultModal
          classItem={selected}
          students={selectedStudents}
          assignments={selectedAssignments}
          exams={selectedExams}
          existingResults={selectedResults}
          onClose={() => setGrading(false)}
          onSave={saveResult}
        />
      )}
    </>
  );
}
