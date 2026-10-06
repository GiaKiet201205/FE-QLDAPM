import {
  ChevronDown,
  Download,
  Plus,
  Search,
  UserPlus,
  Trash2,
} from "lucide-react";
import Button from "../../components/ui/Button";
import EntityTable from "../../components/ui/EntityTable";
import DetailPanel from "../../components/ui/DetailPanel";
import { courseTargetDefinitions } from "../academic/targetEligibility";

const labelClass =
  "mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400";

function getInitials(fullName) {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Status({ status }) {
  const dot =
    status === "Active"
      ? "bg-emerald-500"
      : status === "On Leave"
        ? "bg-amber-500"
        : "bg-slate-400";

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-600">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

function Avatar({ student, large = false }) {
  const tone =
    student.tone === "navy"
      ? "bg-[#173557] text-white"
      : student.tone === "amber"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-200 text-slate-600";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${large ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs"} ${tone}`}
    >
      {getInitials(student.fullName)}
    </span>
  );
}

function FilterSelect({ value, onChange, label, options }) {
  return (
    <div className="relative min-w-36 flex-1 sm:flex-none">
      <select
        className="h-9 w-full cursor-pointer appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-8 text-[13px] text-slate-700 focus:border-blue-600 focus:outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400"
      />
    </div>
  );
}

function StudentDetail({
  student,
  classes,
  results,
  tab,
  setTab,
  onClose,
  onEdit,
  onChangeStatus,
  studentTargets,
  onDelete,
}) {
  return (
    <DetailPanel
      title="Student Detail"
      tabs={
        student
          ? [
              { key: "Overview", label: "Overview" },
              { key: "Classes", label: "Classes" },
              { key: "Results", label: "Results" },
            ]
          : []
      }
      activeTab={tab}
      onTabChange={setTab}
      onClose={onClose}
      footer={
        student && (onEdit || onChangeStatus || onDelete) ? (
          <div className="grid gap-2">
            {onEdit && (
              <Button variant="primary" className="w-full" onClick={onEdit}>
                Edit Student
              </Button>
            )}

            {onChangeStatus && student.status === "Active" && (
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => onChangeStatus("On Leave")}>
                  Put On Leave
                </Button>
                <Button onClick={() => onChangeStatus("Graduated")}>
                  Mark Graduated
                </Button>
              </div>
            )}

            {onChangeStatus && student.status === "On Leave" && (
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => onChangeStatus("Active")}>
                  Reactivate
                </Button>
                <Button onClick={() => onChangeStatus("Graduated")}>
                  Mark Graduated
                </Button>
              </div>
            )}

            {student.status === "Graduated" && onChangeStatus && (
              <div className="grid gap-2">
                <Button onClick={() => onChangeStatus("Active")}>
                  Reactivate Returning Student
                </Button>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
                  Reactivation restores the StudentRecord only. Previous class
                  memberships stay historical and must be assigned again explicitly.
                </div>
              </div>
            )}

            {onDelete && (
              <button
                type="button"
                className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600"
                onClick={onDelete}
              >
                <Trash2 size={14} />
                Delete Student
              </button>
            )}
          </div>
        ) : null
      }
    >
      {student ? (
        <>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Avatar student={student} large />
            <div className="min-w-0">
              <strong className="block truncate text-sm font-semibold text-slate-900">
                {student.fullName}
              </strong>
              <span className="block font-mono text-xs text-slate-400">
                {student.studentCode}
              </span>
            </div>
          </div>

          {tab === "Overview" && (
            <>
              <div className="grid grid-cols-2 gap-3 border-b border-slate-100 py-3.5 text-[13px]">
                <div>
                  <span className={labelClass}>Student Code</span>
                  <strong className="font-mono text-xs font-medium">
                    {student.studentCode}
                  </strong>
                </div>
                <div>
                  <span className={labelClass}>Status</span>
                  <Status status={student.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-b border-slate-100 py-3.5 text-[13px]">
                <div>
                  <span className={labelClass}>Phone</span>
                  <span>{student.phone || "—"}</span>
                </div>
                <div className="min-w-0">
                  <span className={labelClass}>Email</span>
                  <span className="break-all">{student.email || "—"}</span>
                </div>
              </div>

              <div className="border-b border-slate-100 py-3.5 text-[13px]">
                <span className={labelClass}>Course targets</span>
                <div className="grid gap-2">
                  {Object.entries(courseTargetDefinitions).map(
                    ([courseId, definition]) => {
                      const targets = studentTargets.filter(
                        (target) =>
                          target.studentId === student.id &&
                          target.courseId === courseId,
                      );

                      if (!targets.length) return null;

                      return (
                        <div
                          key={courseId}
                          className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                        >
                          <strong className="block text-xs font-medium text-slate-700">
                            {definition.courseLabel}
                          </strong>
                          <span className="mt-1 block text-xs text-slate-500">
                            {definition.targets
                              .map((targetDefinition) => {
                                const value = targets.find(
                                  (target) =>
                                    target.targetType === targetDefinition.type,
                                )?.targetValue;
                                return value == null
                                  ? null
                                  : `${targetDefinition.label}: ${value}`;
                              })
                              .filter(Boolean)
                              .join(" · ") || "Target not configured"}
                          </span>
                        </div>
                      );
                    },
                  )}

                  {!studentTargets.some(
                    (target) => target.studentId === student.id,
                  ) && (
                    <span className="text-xs text-slate-400">
                      No course target has been configured.
                    </span>
                  )}
                </div>
              </div>

              <div className="py-3.5 text-[13px]">
                <span className={labelClass}>Current classes</span>
                <span>{classes.length || 0}</span>
              </div>
            </>
          )}

          {tab === "Classes" && (
            <div className="grid gap-2 pt-4">
              {classes.length ? (
                classes.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="rounded-md border border-slate-200 bg-white p-3"
                  >
                    <strong className="block text-[13px] font-medium text-slate-800">
                      {classItem.name}
                    </strong>
                    <span className="mt-1 block font-mono text-xs text-slate-400">
                      {classItem.classCode}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {classItem.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-xs text-slate-400">
                  This student is not assigned to a class yet.
                </p>
              )}
            </div>
          )}

          {tab === "Results" && (
            <div className="grid gap-2 pt-4">
              {results.length ? (
                results
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.evaluatedAt).getTime() -
                      new Date(a.evaluatedAt).getTime(),
                  )
                  .map((result) => {
                    const classItem = classes.find(
                      (item) => item.id === result.classId,
                    );
                    return (
                      <div
                        key={result.id}
                        className="rounded-md border border-slate-200 bg-white p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <strong className="block text-[13px] font-medium text-slate-800">
                              {classItem?.classCode ?? "Class result"}
                            </strong>
                            <span className="mt-1 block text-xs text-slate-500">
                              {result.feedback || "No feedback"}
                            </span>
                          </div>
                          <strong className="text-sm font-semibold text-[#173557]">
                            {result.score}
                          </strong>
                        </div>
                        <span className="mt-2 block text-[11px] text-slate-400">
                          Evaluated {new Date(result.evaluatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    );
                  })
              ) : (
                <p className="py-6 text-center text-xs text-slate-400">
                  No academic result has been recorded yet.
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="py-6 text-center text-[13px] text-slate-400">
          Select a student to see their details.
        </p>
      )}
    </DetailPanel>
  );
}

export default function StudentsView({
  roleKey,
  canManage,
  search,
  onSearch,
  status,
  onStatus,
  classFilter,
  onClassFilter,
  classes,
  classStudents,
  onExport,
  onAdd,
  onAssignSelected,
  onClearSelection,
  message,
  visible,
  selectedId,
  checked,
  onToggleAll,
  onToggleOne,
  onSelect,
  filteredCount,
  page,
  pageSize,
  onPage,
  selected,
  selectedClasses,
  selectedResults,
  tab,
  setTab,
  onCloseDetail,
  onEdit,
  onChangeStatus,
  studentTargets,
  onDelete,
}) {
  function classSummary(studentId) {
    const related = classStudents
      .filter(
        (relation) =>
          relation.studentId === studentId && relation.status === "ACTIVE",
      )
      .map((relation) => classes.find((item) => item.id === relation.classId))
      .filter(Boolean);

    if (!related.length) return "—";
    if (related.length === 1) return related[0].classCode;
    return `${related[0].classCode} +${related.length - 1}`;
  }

  const columns = [
    {
      key: "fullName",
      label: "Student",
      width: "w-[32%]",
      render: (student) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar student={student} />
          <div className="min-w-0">
            <strong className="block truncate font-semibold text-slate-900">
              {student.fullName}
            </strong>
            <span className="block truncate text-xs text-slate-400">
              {student.email || "No email"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "studentCode",
      label: "Student Code",
      width: "w-[20%]",
      cellClassName: "font-mono text-xs",
    },
    {
      key: "classes",
      label: "Class",
      width: "w-[22%]",
      render: (student) => classSummary(student.id),
    },
    {
      key: "phone",
      label: "Phone",
      width: "w-[16%]",
      render: (student) => student.phone || "—",
    },
    {
      key: "status",
      label: "Status",
      width: "w-[10%]",
      render: (student) => <Status status={student.status} />,
    },
  ];

  return (
    <div className="font-sans text-[13px] leading-5 text-slate-800 antialiased">
      <div className="mb-3 text-xs text-slate-500">
        {roleKey === "TEACHER"
          ? "Teacher view: students from your assigned classes only."
          : "Admin view: manage internal student records and class membership."}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex h-9 min-w-52 flex-1 items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 text-slate-400 xl:max-w-80">
          <Search size={16} />
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search name, code, email or phone..."
            aria-label="Search students"
          />
        </div>

        <FilterSelect
          value={classFilter}
          onChange={onClassFilter}
          label="Filter by class"
          options={[
            { value: "ALL", label: "All Classes" },
            ...classes.map((item) => ({
              value: item.id,
              label: item.classCode,
            })),
          ]}
        />

        <FilterSelect
          value={status}
          onChange={onStatus}
          label="Filter by status"
          options={[
            { value: "All Status", label: "All Status" },
            { value: "Active", label: "Active" },
            { value: "On Leave", label: "On Leave" },
            { value: "Graduated", label: "Graduated" },
          ]}
        />

        <div className="hidden flex-1 2xl:block" />

        <Button onClick={onExport}>
          <Download size={15} />
          {checked.length ? "Export Selected" : "Export"}
        </Button>

        {onAdd && (
          <Button variant="primary" onClick={onAdd}>
            <Plus size={16} />
            Add Student
          </Button>
        )}
      </div>

      {canManage && checked.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-xs font-medium text-slate-600">
            {checked.length} student{checked.length === 1 ? "" : "s"} selected
          </span>
          <div className="flex items-center gap-2">
            {onAssignSelected && (
              <Button onClick={onAssignSelected}>
                <UserPlus size={14} />
                Add to Class
              </Button>
            )}
            <button
              type="button"
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
              onClick={onClearSelection}
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className="mb-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_350px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <EntityTable
          label="Students"
          columns={columns}
          rows={visible}
          getRowId={(student) => student.id}
          selectedId={selectedId}
          onRowClick={(student) => onSelect(student.id)}
          checkedIds={canManage ? checked : []}
          onToggleRow={canManage ? onToggleOne : undefined}
          onTogglePage={canManage ? onToggleAll : undefined}
          page={page}
          pageSize={pageSize}
          total={filteredCount}
          onPageChange={onPage}
          itemLabel="students"
          emptyMessage="No students match your scope and filters."
        />

        <StudentDetail
          student={selected}
          classes={selectedClasses}
          results={selectedResults}
          tab={tab}
          setTab={setTab}
          onClose={onCloseDetail}
          onEdit={onEdit}
          onChangeStatus={onChangeStatus}
          studentTargets={studentTargets}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
