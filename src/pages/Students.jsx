import { useMemo, useState } from "react";
import StudentsView from "../features/students/StudentsView";
import StudentFormModal from "../features/students/StudentFormModal";
import {
  initialStudents,
  seededStudents,
  PAGE_SIZE,
  emptyForm,
} from "../features/students/mockStudents";

export default function Students() {
  const [students, setStudents] = useState(seededStudents);
  const [selectedId, setSelectedId] = useState(initialStudents[0].id);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("Overview");
  const [checked, setChecked] = useState([]);
  const [editing, setEditing] = useState(undefined);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return students.filter((student) => {
      const searchable = `${student.fullName} ${student.studentCode} ${student.email ?? ""} ${student.phone ?? ""}`
        .toLowerCase();

      return (
        searchable.includes(keyword) &&
        (status === "All Status" || student.status === status)
      );
    });
  }, [students, search, status]);

  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = students.find((student) => student.id === selectedId) ?? null;
  const allVisibleChecked =
    visible.length > 0 &&
    visible.every((student) => checked.includes(student.id));

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
    setChecked([]);
  }

  function toggleOne(id) {
    setChecked((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function toggleAll() {
    setChecked((current) =>
      allVisibleChecked
        ? current.filter((id) => !visible.some((student) => student.id === id))
        : [...new Set([...current, ...visible.map((student) => student.id)])],
    );
  }

  function exportCsv() {
    const rows = checked.length
      ? students.filter((student) => checked.includes(student.id))
      : filtered;

    const csv = [
      ["Student Code", "Full Name", "Email", "Phone", "Status"],
      ...rows.map((student) => [
        student.studentCode,
        student.fullName,
        student.email ?? "",
        student.phone ?? "",
        student.status,
      ]),
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
    link.download = "students.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function saveStudent(form) {
    if (editing) {
      setStudents((current) =>
        current.map((student) =>
          student.id === editing.id
            ? {
                ...student,
                ...form,
              }
            : student,
        ),
      );
    } else {
      const newStudent = {
        ...form,
        id: `student-${Date.now()}`,
        tone: "navy",
      };

      setStudents((current) => [newStudent, ...current]);
      setSelectedId(newStudent.id);
      setPage(1);
      setSearch("");
      setStatus("All Status");
    }

    setEditing(undefined);
    setTab("Overview");
  }

  return (
    <>
      <StudentsView
        search={search}
        onSearch={(value) => changeFilter(setSearch, value)}
        status={status}
        onStatus={(value) => changeFilter(setStatus, value)}
        onExport={exportCsv}
        onAdd={() => setEditing(null)}
        visible={visible}
        selectedId={selectedId}
        checked={checked}
        onToggleAll={toggleAll}
        onToggleOne={toggleOne}
        onSelect={(id) => {
          setSelectedId(id);
          setTab("Overview");
        }}
        filteredCount={filtered.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPage={setPage}
        selected={selected}
        tab={tab}
        setTab={setTab}
        onCloseDetail={() => setSelectedId(null)}
        onEdit={() => setEditing(selected)}
      />

      {editing !== undefined && (
        <StudentFormModal
          student={editing}
          emptyForm={emptyForm}
          onClose={() => setEditing(undefined)}
          onSave={saveStudent}
        />
      )}
    </>
  );
}
