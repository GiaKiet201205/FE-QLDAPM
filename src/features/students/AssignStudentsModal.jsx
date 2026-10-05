import { useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function AssignStudentsModal({
  studentIds,
  students,
  classes,
  classStudents,
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
      classes.filter((classItem) =>
        selectedStudents.some(
          (student) =>
            !classStudents.some(
              (relation) =>
                relation.studentId === student.id &&
                relation.classId === classItem.id,
            ),
        ),
      ),
    [classes, classStudents, selectedStudents],
  );

  const effectiveClassId =
    availableClasses.some((classItem) => classItem.id === classId)
      ? classId
      : availableClasses[0]?.id ?? "";

  function submit(event) {
    event.preventDefault();
    if (!effectiveClassId) return;
    onAssign(effectiveClassId);
  }

  return (
    <Modal title="Add students to class" onClose={onClose} maxWidth="max-w-lg">
      <form onSubmit={submit} className="grid gap-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-600">
          <strong className="font-medium text-slate-800">
            {selectedStudents.length} student{selectedStudents.length === 1 ? "" : "s"}
          </strong>{" "}
          selected.
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

        {!availableClasses.length && (
          <p className="text-xs text-slate-500">
            All selected students are already assigned to every available class.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!availableClasses.length}>
            Add to Class
          </Button>
        </div>
      </form>
    </Modal>
  );
}
