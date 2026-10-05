import {
  ChevronDown,
  Download,
  Plus,
  Search,
  Users,
  CalendarDays,
  ClipboardList,
  ShieldCheck,
  History,
} from "lucide-react";
import Button from "../../components/ui/Button";
import EntityTable from "../../components/ui/EntityTable";
import DetailPanel from "../../components/ui/DetailPanel";
import { classStatuses, courses } from "./mockClasses";
import { getCsName } from "./mockClassOperations";

const labelClass =
  "mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400";

const statusDots = {
  DRAFT: "bg-slate-400",
  READY: "bg-[#173557]",
  RUNNING: "bg-emerald-500",
  COMPLETED: "bg-slate-500",
  CLOSED: "bg-slate-300",
};

function statusLabel(status) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function courseName(courseId) {
  return courses.find((course) => course.id === courseId)?.name ?? "—";
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function StatusLabel({ status }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-600">
      <span
        className={`h-1.5 w-1.5 rounded-full ${statusDots[status] ?? statusDots.DRAFT}`}
      />
      {statusLabel(status)}
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

function RelationPlaceholder({ icon: Icon, title, description }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
      <Icon size={20} className="mx-auto mb-2 text-slate-400" />
      <strong className="block text-sm font-medium text-slate-700">
        {title}
      </strong>
      <span className="mt-1 block text-xs leading-5 text-slate-400">
        {description}
      </span>
    </div>
  );
}

function SupportList({ schedules, canOverride, onOverride }) {
  if (!schedules.length) {
    return (
      <RelationPlaceholder
        icon={ShieldCheck}
        title="No CS support schedule"
        description="CS support for this class is derived from StaffSchedule and assigned by Center Management."
      />
    );
  }

  return (
    <div className="grid gap-2">
      {schedules.map((schedule) => (
        <div
          key={schedule.id}
          className="rounded-md border border-slate-200 bg-white p-3 text-[13px]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <strong className="block font-medium text-slate-800">
                {getCsName(schedule.userId)}
              </strong>
              <span className="text-xs text-slate-500">
                {schedule.date} · {schedule.startTime}–{schedule.endTime}
              </span>
              <span className="mt-1 block text-[11px] text-slate-400">
                Assigned by {schedule.assignedBy}
              </span>
            </div>
            {canOverride && (
              <button
                type="button"
                className="text-xs font-medium text-[#173557] hover:underline"
                onClick={() => onOverride(schedule)}
              >
                Administrative Override
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AuditList({ logs }) {
  if (!logs.length) {
    return (
      <RelationPlaceholder
        icon={History}
        title="No class audit activity yet"
        description="Important class updates, status changes and administrative interventions will appear here."
      />
    );
  }

  return (
    <div className="grid gap-2">
      {logs.map((log) => (
        <div key={log.id} className="border-b border-slate-100 pb-2 text-xs">
          <strong className="block font-medium text-slate-700">{log.action}</strong>
          <span className="text-slate-500">{log.userName}</span>
          <span className="ml-2 text-slate-400">
            {new Date(log.createdAt).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

function ClassDetail({
  classItem,
  roleKey,
  tab,
  setTab,
  onClose,
  onEdit,
  onAdvanceStatus,
  supportSchedules,
  auditLogs,
  onOverrideSupport,
}) {
  const currentIndex = classItem ? classStatuses.indexOf(classItem.status) : -1;
  const nextStatus =
    currentIndex >= 0 && currentIndex < classStatuses.length - 1
      ? classStatuses[currentIndex + 1]
      : null;

  const tabs = classItem
    ? [
        { key: "Overview", label: "Overview" },
        { key: "Students", label: "Students" },
        { key: "Schedule", label: "Schedule" },
        { key: "Support", label: roleKey === "CS" ? "My Support" : "Support" },
        { key: "Assignments", label: "Assignments" },
        ...(roleKey === "ADMIN" ? [{ key: "Audit", label: "Audit" }] : []),
      ]
    : [];

  return (
    <DetailPanel
      title="Class Detail"
      tabs={tabs}
      activeTab={tab}
      onTabChange={setTab}
      onClose={onClose}
      footer={
        classItem && (
          <div className="grid gap-2">
            {onEdit && (
              <Button variant="primary" className="w-full" onClick={onEdit}>
                Edit Class Details
              </Button>
            )}
            {nextStatus && (
              <Button className="w-full" onClick={() => onAdvanceStatus(nextStatus)}>
                Move to {statusLabel(nextStatus)}
              </Button>
            )}
          </div>
        )
      }
    >
      {classItem ? (
        <>
          <div className="border-b border-slate-100 pb-4">
            <strong className="block text-sm font-semibold text-slate-900">
              {classItem.name}
            </strong>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-slate-400">
                {classItem.classCode}
              </span>
              <span className="text-slate-300">•</span>
              <StatusLabel status={classItem.status} />
            </div>
          </div>

          {tab === "Overview" && (
            <>
              <div className="grid grid-cols-2 gap-3 border-b border-slate-100 py-3.5 text-[13px]">
                <div>
                  <span className={labelClass}>Course</span>
                  <strong className="font-medium">{courseName(classItem.courseId)}</strong>
                </div>
                <div>
                  <span className={labelClass}>Status</span>
                  <StatusLabel status={classItem.status} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 border-b border-slate-100 py-3.5 text-[13px]">
                <div>
                  <span className={labelClass}>Start date</span>
                  <span>{formatDate(classItem.startDate)}</span>
                </div>
                <div>
                  <span className={labelClass}>End date</span>
                  <span>{formatDate(classItem.endDate)}</span>
                </div>
              </div>
              <div className="py-3.5 text-[13px]">
                <span className={labelClass}>Created by</span>
                <span className="font-mono text-xs text-slate-500">
                  {classItem.createdBy}
                </span>
              </div>
            </>
          )}

          {tab === "Students" && (
            <div className="pt-4">
              <RelationPlaceholder
                icon={Users}
                title="ClassStudent connection pending"
                description="Students belong to the class through ClassStudent, not fields embedded in Class."
              />
            </div>
          )}

          {tab === "Schedule" && (
            <div className="pt-4">
              <RelationPlaceholder
                icon={CalendarDays}
                title="TeachingSchedule connection pending"
                description="Teacher assignment and teaching time belong to TeachingSchedule."
              />
            </div>
          )}

          {tab === "Support" && (
            <div className="pt-4">
              <SupportList
                schedules={supportSchedules}
                canOverride={roleKey === "ADMIN" && Boolean(onOverrideSupport)}
                onOverride={onOverrideSupport}
              />
            </div>
          )}

          {tab === "Assignments" && (
            <div className="pt-4">
              <RelationPlaceholder
                icon={ClipboardList}
                title="Assignment and Exam modules pending"
                description="Teaching activities remain separate entities linked to the class."
              />
            </div>
          )}

          {tab === "Audit" && roleKey === "ADMIN" && (
            <div className="pt-4">
              <AuditList logs={auditLogs} />
            </div>
          )}
        </>
      ) : (
        <p className="py-6 text-center text-[13px] text-slate-400">
          Select a class to see its details.
        </p>
      )}
    </DetailPanel>
  );
}

export default function ClassesView({
  roleKey,
  search,
  onSearch,
  course,
  onCourse,
  status,
  onStatus,
  onExport,
  onCreate,
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
  onAdvanceStatus,
  supportSchedules,
  auditLogs,
  onOverrideSupport,
}) {
  const columns = [
    {
      key: "classCode",
      label: "Class Code",
      width: "w-[18%]",
      cellClassName: "font-mono text-xs break-all",
    },
    {
      key: "name",
      label: "Class Name",
      width: "w-[28%]",
      cellClassName: "font-medium text-slate-900",
    },
    {
      key: "courseId",
      label: "Course",
      width: "w-[18%]",
      render: (classItem) => courseName(classItem.courseId),
    },
    {
      key: "startDate",
      label: "Start",
      width: "w-[18%]",
      render: (classItem) => formatDate(classItem.startDate),
    },
    {
      key: "status",
      label: "Status",
      width: "w-[18%]",
      render: (classItem) => <StatusLabel status={classItem.status} />,
    },
  ];

  return (
    <div className="font-sans text-[13px] leading-5 text-slate-800 antialiased">
      <div className="mb-3 text-xs text-slate-500">
        {roleKey === "ADMIN"
          ? "Admin view: all classes and system-level monitoring."
          : "CS view: only classes within your assigned support scope or created by you."}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex h-9 min-w-52 flex-1 items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 text-slate-400 xl:max-w-80">
          <Search size={16} />
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search by class code or name..."
            aria-label="Search classes"
          />
        </div>

        <FilterSelect
          value={course}
          onChange={onCourse}
          label="Filter by course"
          options={[
            { value: "ALL", label: "All Courses" },
            ...courses.map((item) => ({ value: item.id, label: item.name })),
          ]}
        />

        <FilterSelect
          value={status}
          onChange={onStatus}
          label="Filter by status"
          options={[
            { value: "ALL", label: "All Status" },
            ...classStatuses.map((item) => ({
              value: item,
              label: statusLabel(item),
            })),
          ]}
        />

        <div className="hidden flex-1 2xl:block" />

        <Button onClick={onExport}>
          <Download size={15} />
          Export
        </Button>

        {onCreate && (
          <Button variant="primary" onClick={onCreate}>
            <Plus size={16} />
            Create Class
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_318px]">
        <EntityTable
          label="Classes"
          columns={columns}
          rows={visible}
          getRowId={(classItem) => classItem.id}
          selectedId={selectedId}
          onRowClick={(classItem) => onSelect(classItem.id)}
          checkedIds={checked}
          onToggleRow={onToggleOne}
          onTogglePage={onToggleAll}
          page={page}
          pageSize={pageSize}
          total={filteredCount}
          onPageChange={onPage}
          itemLabel="classes"
          emptyMessage="No classes match your scope and filters."
        />

        <ClassDetail
          classItem={selected}
          roleKey={roleKey}
          tab={tab}
          setTab={setTab}
          onClose={onCloseDetail}
          onEdit={onEdit}
          onAdvanceStatus={onAdvanceStatus}
          supportSchedules={supportSchedules}
          auditLogs={auditLogs}
          onOverrideSupport={onOverrideSupport}
        />
      </div>
    </div>
  );
}
