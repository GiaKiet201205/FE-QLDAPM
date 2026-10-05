import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

export default function AddClassStudentsModal({
  classItem,
  students,
  classStudents,
  onClose,
  onAdd,
}) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const currentIds = useMemo(
    () =>
      new Set(
        classStudents
          .filter(
            (relation) =>
              relation.classId === classItem.id && relation.status === "ACTIVE",
          )
          .map((relation) => relation.studentId),
      ),
    [classStudents, classItem.id],
  );

  const candidates = students.filter((student) => {
    if (currentIds.has(student.id)) return false;
    const keyword = search.trim().toLowerCase();
    const haystack =
      `${student.fullName} ${student.studentCode} ${student.email ?? ""}`.toLowerCase();
    return haystack.includes(keyword);
  });

  function toggle(id) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function submit(event) {
    event.preventDefault();
    if (!selectedIds.length) return;
    onAdd(selectedIds);
  }

  return (
    <Modal
      title={`Add students · ${classItem.classCode}`}
      onClose={onClose}
      maxWidth="max-w-xl"
    >
      <form onSubmit={submit} className="grid gap-4">
        <div className="flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 text-slate-400">
          <Search size={15} />
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-800 outline-none"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student name or code..."
          />
        </div>

        <div className="max-h-72 overflow-auto rounded-md border border-slate-200">
          {candidates.length ? (
            candidates.map((student) => (
              <label
                key={student.id}
                className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2.5 last:border-0 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#173557]"
                  checked={selectedIds.includes(student.id)}
                  onChange={() => toggle(student.id)}
                />
                <span className="min-w-0">
                  <strong className="block truncate text-[13px] font-medium text-slate-800">
                    {student.fullName}
                  </strong>
                  <span className="font-mono text-xs text-slate-400">
                    {student.studentCode}
                  </span>
                </span>
              </label>
            ))
          ) : (
            <p className="p-5 text-center text-xs text-slate-400">
              No eligible students found.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2">
            <Button type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={!selectedIds.length}>
              Add Students
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
