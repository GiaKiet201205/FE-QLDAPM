import { ChevronDown, Download, Plus, Search } from "lucide-react";
import Button from "../../components/ui/Button";
import EntityTable from "../../components/ui/EntityTable";
import DetailPanel from "../../components/ui/DetailPanel";

const labelClass =
  "mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400";
const detailSectionClass =
  "border-b border-slate-100 py-3.5 text-[13px] leading-5";

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
      {student.initials}
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

function Summary({ student }) {
  return (
    <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs">
      <div className="flex justify-between gap-2">
        <span className="text-slate-500">Attendance</span>
        <strong className="text-right font-medium">{student.attendance}</strong>
      </div>
      <div className="flex justify-between gap-2">
        <span className="text-slate-500">Score progress</span>
        <strong className="text-right font-medium">{student.progress}</strong>
      </div>
      <div className="flex justify-between gap-2">
        <span className="text-slate-500">Teacher</span>
        <strong className="text-right font-medium">{student.teacher}</strong>
      </div>
    </div>
  );
}

function HistoryRow({ date, event, result }) {
  return (
    <div className="grid min-h-9 grid-cols-[52px_1fr_auto] items-center gap-2 border border-b-0 border-slate-200 px-2 text-xs last:border-b">
      <span className="font-mono text-[11px] text-slate-400">{date}</span>
      <span>{event}</span>
      <strong className="font-medium">{result}</strong>
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
              { key: "Learning", label: "Learning" },
              { key: "History", label: "History" },
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
            <div>
              <strong className="block text-sm font-semibold text-slate-900">
                {student.name}
              </strong>
              <span className="block text-xs text-slate-400">
                Enrolled: Aug 15, 2024
              </span>
            </div>
          </div>
          {tab === "Overview" && (
            <>
              <div className="grid grid-cols-2 gap-3 border-b border-slate-100 py-3.5 text-[13px]">
                <div>
                  <span className={labelClass}>Student ID</span>
                  <strong className="font-mono text-xs font-medium">
                    {student.id}
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
                  <span>{student.phone}</span>
                </div>
                <div className="min-w-0">
                  <span className={labelClass}>Email</span>
                  <span className="break-all">{student.email}</span>
                </div>
              </div>
              <div className={detailSectionClass}>
                <span className={labelClass}>Current Class</span>
                <strong className="font-medium">
                  {student.className}
                </strong>{" "}
                <span className="text-xs text-slate-400">
                  (Room 402 · Mon, Wed 18:30)
                </span>
              </div>
              <div className={detailSectionClass}>
                <span className={labelClass}>Learning Summary</span>
                <Summary student={student} />
              </div>
              <div className={detailSectionClass}>
                <span className={labelClass}>Recent Academic History</span>
                <HistoryRow
                  date="Oct 12"
                  event="Mock Test #3"
                  result={student.result}
                />
                <HistoryRow
                  date="Oct 01"
                  event="Mid-term Exam"
                  result={
                    student.course === "IELTS" ? "Band 7.0" : student.result
                  }
                />
              </div>
            </>
          )}
          {tab === "Learning" && (
            <div className="pt-4">
              <span className={labelClass}>Current course</span>
              <h3 className="mb-3 text-sm font-semibold">
                {student.course} · {student.className}
              </h3>
              <Summary student={student} />
            </div>
          )}
          {tab === "History" && (
            <div className="pt-4">
              <span className={labelClass}>Academic history</span>
              <HistoryRow
                date="Oct 12"
                event="Mock Test #3"
                result={student.result}
              />
              <HistoryRow
                date="Oct 01"
                event="Mid-term Exam"
                result={
                  student.course === "IELTS" ? "Band 7.0" : student.result
                }
              />
              <HistoryRow
                date="Aug 15"
                event="Enrolled"
                result={student.course}
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
  course,
  onCourse,
  classFilter,
  onClass,
  status,
  onStatus,
  classOptions,
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
      key: "name",
      label: "Student",
      width: "w-[32%]",
      render: (student) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar student={student} />
          <div className="min-w-0">
            <strong className="block truncate font-semibold text-slate-900">
              {student.name}
            </strong>
            <span className="block truncate text-xs text-slate-400">
              {student.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "id",
      label: "Student ID",
      width: "w-[16%]",
      cellClassName: "font-mono text-xs break-all",
    },
    {
      key: "className",
      label: "Class",
      width: "w-[18%]",
      cellClassName: "break-words",
    },
    {
      key: "status",
      label: "Status",
      width: "w-[16%]",
      render: (student) => <Status status={student.status} />,
    },
    {
      key: "result",
      label: "Result",
      width: "w-[18%]",
      render: (student) => (
        <>
          <strong className="block whitespace-nowrap font-medium text-slate-900">
            {student.result}
          </strong>
          {student.resultNote && (
            <span className="block whitespace-nowrap text-xs text-slate-400">
              {student.resultNote}
            </span>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="font-sans text-[13px] leading-5 text-slate-800 antialiased">
      <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex h-9 min-w-52 flex-1 items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 text-slate-400 xl:max-w-72">
          <Search size={16} />
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search student by name, ID..."
            aria-label="Search students"
          />
        </div>
        <FilterSelect
          value={course}
          onChange={onCourse}
          label="Filter by course"
          options={["All Courses", "IELTS", "TOEIC", "SAT"]}
        />
        <FilterSelect
          value={classFilter}
          onChange={onClass}
          label="Filter by class"
          options={["All Classes", ...classOptions]}
        />
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
