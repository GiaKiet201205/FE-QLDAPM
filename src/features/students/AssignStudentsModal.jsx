import { useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { assignableClassStatuses } from "../academic/targetEligibility";

const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function AssignStudentsModal({
  studentIds,
  students,
  classes,
  classStudents,
  getEligibility,
  onClose,
  onAssign,
}) {
  const [classId, setClassId] = useState(classes[0]?.id ?? "");

  const selectedStudents = useMemo(
    () => students.filter((student) => studentIds.includes(student.id)),
    [students, studentIds],
  );

  const availableClasses = useMemo(
    () =>
      classes
        .filter((classItem) => assignableClassStatuses.includes(classItem.status))
        .filter((classItem) =>
          selectedStudents.some(
          (student) =>
            !classStudents.some(
              (relation) =>
                relation.studentId === student.id &&
                relation.classId === classItem.id &&
                relation.status === "ACTIVE",
            ),
        ),
        ),
    [classes, classStudents, selectedStudents],
  );

  const effectiveClassId =
    availableClasses.some((classItem) => classItem.id === classId)
      ? classId
      : availableClasses[0]?.id ?? "";

  const selectedClass = availableClasses.find(
    (classItem) => classItem.id === effectiveClassId,
  );

  const evaluations = useMemo(() => {
    if (!selectedClass) return [];

    return selectedStudents.map((student) => {
      const alreadyActive = classStudents.some(
        (relation) =>
          relation.studentId === student.id &&
          relation.classId === selectedClass.id &&
          relation.status === "ACTIVE",
      );

      return {
        student,
        alreadyActive,
        eligibility: alreadyActive
          ? { eligible: true, reasons: [], checks: [] }
          : getEligibility(student.id, selectedClass.id),
      };
    });
  }, [
    selectedStudents,
    selectedClass,
    classStudents,
    getEligibility,
  ]);

  const blocked = evaluations.filter(
    (item) => !item.alreadyActive && !item.eligibility.eligible,
  );
  const assignableCount = evaluations.filter(
    (item) => !item.alreadyActive && item.eligibility.eligible,
  ).length;

  function submit(event) {
    event.preventDefault();
    if (!effectiveClassId || blocked.length || !assignableCount) return;
    onAssign(effectiveClassId);
  }

  return (
    <Modal title="Add students to class" onClose={onClose} maxWidth="max-w-xl">
      <form onSubmit={submit} className="grid gap-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-600">
          <strong className="font-medium text-slate-800">
            {selectedStudents.length} student
            {selectedStudents.length === 1 ? "" : "s"}
          </strong>{" "}
          selected. Each student must have a target for the selected class course
          and meet that class target before membership can be created.
        </div>

        <label className="grid gap-1.5 text-[13px] font-medium">
          Class
          <select
            className={inputClass}
            value={effectiveClassId}
            onChange={(event) => setClassId(event.target.value)}
            disabled={!availableClasses.length}
          >
            {availableClasses.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.classCode} · {classItem.name}
              </option>
            ))}
          </select>
        </label>

        {selectedClass && (
          <div className="max-h-64 overflow-auto rounded-md border border-slate-200">
            {evaluations.map(({ student, alreadyActive, eligibility }) => (
              <div
                key={student.id}
                className="border-b border-slate-100 px-3 py-2.5 last:border-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <strong className="block truncate text-[13px] font-medium text-slate-800">
                      {student.fullName}
                    </strong>
                    <span className="font-mono text-xs text-slate-400">
                      {student.studentCode}
                    </span>
                  </div>
                  <span
                    className={
                      alreadyActive || eligibility.eligible
                        ? "text-xs font-medium text-emerald-700"
                        : "text-xs font-medium text-red-600"
                    }
                  >
                    {alreadyActive
                      ? "Already in class"
                      : eligibility.eligible
                        ? "Eligible"
                        : "Blocked"}
                  </span>
                </div>

                {!alreadyActive && !eligibility.eligible && (
                  <ul className="mt-2 grid gap-1 text-xs text-red-600">
                    {eligibility.reasons.map((reason) => (
                      <li key={reason}>• {reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {blocked.length > 0 && (
          <p className="text-xs leading-5 text-red-600">
            The assignment is blocked because {blocked.length} selected student
            {blocked.length === 1 ? "" : "s"} do not meet this class target.
            Remove them from the selection, configure the required course target,
            or choose a suitable class.
          </p>
        )}

        {!availableClasses.length && (
          <p className="text-xs text-slate-500">
            No class currently accepts these students. Completed and closed classes
            cannot receive roster changes.
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {assignableCount} student{assignableCount === 1 ? "" : "s"} can be added
          </span>
          <div className="flex gap-2">
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!availableClasses.length || blocked.length > 0 || !assignableCount}
            >
              Add to Class
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
