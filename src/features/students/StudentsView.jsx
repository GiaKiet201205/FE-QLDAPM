import { ChevronDown, Download, Plus, Search } from "lucide-react";
import Button from "../../components/ui/Button";
import EntityTable from "../../components/ui/EntityTable";
import DetailPanel from "../../components/ui/DetailPanel";

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
  const color =
    status === "On Leave"
      ? "text-amber-700"
      : status === "Graduated"
        ? "text-slate-500"
        : "text-slate-700";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs ${color}`}
    >
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
    <div className="relative min-w-32 flex-1 sm:flex-none">
      <select
        className="h-9 w-full cursor-pointer appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-8 text-[13px] text-slate-700 focus:border-blue-600 focus:outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400"
      />
    </div>
  );
}

function EmptyRelationState({ title, description }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
      <strong className="block text-sm font-medium text-slate-700">
        {title}
      </strong>
      <span className="mt-1 block text-xs leading-5 text-slate-400">
        {description}
      </span>
    </div>
  );
}

function StudentDetail({ student, tab, setTab, onClose, onEdit }) {
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
        student && (
          <Button variant="primary" className="w-full" onClick={onEdit}>
            Edit Student
          </Button>
        )
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

              <div className="py-3.5 text-[13px]">
                <span className={labelClass}>Internal Record ID</span>
                <span className="break-all font-mono text-xs text-slate-500">
                  {student.id}
                </span>
              </div>
            </>
          )}

          {tab === "Classes" && (
            <div className="pt-4">
              <EmptyRelationState
                title="No class relationships loaded yet"
                description="Class membership will be displayed here from the ClassStudent relationship when the class module is connected."
              />
            </div>
          )}

          {tab === "Results" && (
            <div className="pt-4">
              <EmptyRelationState
                title="No student results loaded yet"
                description="Scores and feedback will be displayed here from StudentResult instead of being stored directly on the student record."
              />
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
  search,
  onSearch,
  status,
  onStatus,
  onExport,
  onAdd,
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
  tab,
  setTab,
  onCloseDetail,
  onEdit,
}) {
  const columns = [
    {
      key: "fullName",
      label: "Student",
      width: "w-[38%]",
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
      width: "w-[22%]",
      cellClassName: "font-mono text-xs break-all",
    },
    {
      key: "phone",
      label: "Phone",
      width: "w-[22%]",
      render: (student) => student.phone || "—",
    },
    {
      key: "status",
      label: "Status",
      width: "w-[18%]",
      render: (student) => <Status status={student.status} />,
    },
  ];

  return (
    <div className="font-sans text-[13px] leading-5 text-slate-800 antialiased">
      <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex h-9 min-w-52 flex-1 items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 text-slate-400 xl:max-w-80">
          <Search size={16} />
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search by name, student code, email..."
            aria-label="Search students"
          />
        </div>

        <FilterSelect
          value={status}
          onChange={onStatus}
          label="Filter by status"
          options={["All Status", "Active", "On Leave", "Graduated"]}
        />

        <div className="hidden flex-1 2xl:block" />

        <Button onClick={onExport}>
          <Download size={15} />
          Export
        </Button>

        <Button variant="primary" onClick={onAdd}>
          <Plus size={16} />
          Add Student
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_318px]">
        <EntityTable
          label="Students"
          columns={columns}
          rows={visible}
          getRowId={(student) => student.id}
          selectedId={selectedId}
          onRowClick={(student) => onSelect(student.id)}
          checkedIds={checked}
          onToggleRow={onToggleOne}
          onTogglePage={onToggleAll}
          page={page}
          pageSize={pageSize}
          total={filteredCount}
          onPageChange={onPage}
          itemLabel="students"
          emptyMessage="No students match your filters."
        />

        <StudentDetail
          student={selected}
          tab={tab}
          setTab={setTab}
          onClose={onCloseDetail}
          onEdit={onEdit}
        />
      </div>
    </div>
  );
}
