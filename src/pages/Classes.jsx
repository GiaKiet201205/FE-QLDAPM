import { useMemo, useState } from "react";
import ClassesView from "../features/classes/ClassesView";
import ClassFormModal from "../features/classes/ClassFormModal";
import SupportOverrideModal from "../features/classes/SupportOverrideModal";
import {
  emptyClassForm,
  initialClasses,
  PAGE_SIZE,
  courses,
  classStatuses,
} from "../features/classes/mockClasses";
import {
  getActorForRole,
  getCsName,
  initialAuditLogs,
  initialStaffSchedules,
} from "../features/classes/mockClassOperations";

function createAudit(actor, action, entityId, details) {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    userId: actor.id,
    userName: actor.fullName,
    action,
    entityType: "CLASS",
    entityId,
    details,
    createdAt: new Date().toISOString(),
  };
}

export default function Classes({ role }) {
  const roleKey = role?.key ?? "ADMIN";
  const actor = getActorForRole(roleKey);
  const isAdmin = roleKey === "ADMIN";
  const isCs = roleKey === "CS";

  const [classes, setClasses] = useState(initialClasses);
  const [staffSchedules, setStaffSchedules] = useState(initialStaffSchedules);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("Overview");
  const [checked, setChecked] = useState([]);
  const [editing, setEditing] = useState(undefined);
  const [overrideSchedule, setOverrideSchedule] = useState(null);

  const scopedClasses = useMemo(() => {
    if (isAdmin) return classes;
    if (!isCs) return [];

    const assignedClassIds = new Set(
      staffSchedules
        .filter(
          (schedule) =>
            schedule.staffRole === "CS" &&
            schedule.userId === actor.id &&
            schedule.status === "ASSIGNED" &&
            schedule.classId,
        )
        .map((schedule) => schedule.classId),
    );

    return classes.filter(
      (classItem) =>
        assignedClassIds.has(classItem.id) || classItem.createdBy === actor.id,
    );
  }, [classes, staffSchedules, isAdmin, isCs, actor.id]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return scopedClasses.filter((classItem) => {
      const searchable = `${classItem.classCode} ${classItem.name}`.toLowerCase();

      return (
        searchable.includes(keyword) &&
        (course === "ALL" || classItem.courseId === course) &&
        (status === "ALL" || classItem.status === status)
      );
    });
  }, [scopedClasses, search, course, status]);

  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected =
    scopedClasses.find((classItem) => classItem.id === selectedId) ?? null;
  const selectedSchedules = selected
    ? staffSchedules.filter(
        (schedule) =>
          schedule.classId === selected.id &&
          schedule.staffRole === "CS" &&
          (isAdmin || schedule.userId === actor.id),
      )
    : [];
  const selectedAuditLogs = selected
    ? auditLogs.filter((log) => log.entityId === selected.id)
    : [];

  const allVisibleChecked =
    visible.length > 0 &&
    visible.every((classItem) => checked.includes(classItem.id));

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
        ? current.filter((id) => !visible.some((classItem) => classItem.id === id))
        : [...new Set([...current, ...visible.map((classItem) => classItem.id)])],
    );
  }

  function exportCsv() {
    const rows = checked.length
      ? scopedClasses.filter((classItem) => checked.includes(classItem.id))
      : filtered;

    const csv = [
      [
        "Class Code",
        "Class Name",
        "Course",
        "Start Date",
        "End Date",
        "Status",
        "Created By",
      ],
      ...rows.map((classItem) => [
        classItem.classCode,
        classItem.name,
        courses.find((item) => item.id === classItem.courseId)?.name ?? "",
        classItem.startDate,
        classItem.endDate,
        classItem.status,
        classItem.createdBy,
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
    const linkElement = document.createElement("a");
    linkElement.href = url;
    linkElement.download = "classes.csv";
    linkElement.click();
    URL.revokeObjectURL(url);
  }

  function saveClass(form) {
    if (editing) {
      setClasses((current) =>
        current.map((classItem) =>
          classItem.id === editing.id
            ? {
                ...classItem,
                ...form,
                status: classItem.status,
              }
            : classItem,
        ),
      );
      setAuditLogs((current) => [
        createAudit(actor, "UPDATE_CLASS", editing.id, {
          classCode: form.classCode,
          name: form.name,
        }),
        ...current,
      ]);
    } else {
      const newClass = {
        ...form,
        status: "DRAFT",
        id: `class-${Date.now()}`,
        createdBy: actor.id,
      };

      setClasses((current) => [newClass, ...current]);
      setAuditLogs((current) => [
        createAudit(actor, "CREATE_CLASS", newClass.id, {
          classCode: newClass.classCode,
        }),
        ...current,
      ]);
      setSelectedId(newClass.id);
      setPage(1);
      setSearch("");
      setCourse("ALL");
      setStatus("ALL");
    }

    setEditing(undefined);
    setTab("Overview");
  }

  function advanceStatus(nextStatus) {
    if (!selected) return;

    const currentIndex = classStatuses.indexOf(selected.status);
    const expectedNext = classStatuses[currentIndex + 1];
    if (nextStatus !== expectedNext) return;

    const previousStatus = selected.status;
    setClasses((current) =>
      current.map((classItem) =>
        classItem.id === selected.id
          ? { ...classItem, status: nextStatus }
          : classItem,
      ),
    );
    setAuditLogs((current) => [
      createAudit(actor, "CHANGE_CLASS_STATUS", selected.id, {
        from: previousStatus,
        to: nextStatus,
      }),
      ...current,
    ]);
  }

  function confirmSupportOverride({ scheduleId, newCsId, reason }) {
    if (!isAdmin || !overrideSchedule || !selected) return;

    const oldCsId = overrideSchedule.userId;
    setStaffSchedules((current) =>
      current.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              userId: newCsId,
              assignedBy: actor.id,
              assignmentSource: "ADMIN_OVERRIDE",
            }
          : schedule,
      ),
    );
    setAuditLogs((current) => [
      createAudit(actor, "OVERRIDE_CS_SUPPORT", selected.id, {
        scheduleId,
        fromCs: getCsName(oldCsId),
        toCs: getCsName(newCsId),
        reason,
      }),
      ...current,
    ]);
    setOverrideSchedule(null);
  }

  const canCreate = isAdmin || isCs;
  const canEdit = Boolean(selected) && (isAdmin || isCs);

  return (
    <>
      <ClassesView
        roleKey={roleKey}
        search={search}
        onSearch={(value) => changeFilter(setSearch, value)}
        course={course}
        onCourse={(value) => changeFilter(setCourse, value)}
        status={status}
        onStatus={(value) => changeFilter(setStatus, value)}
        onExport={exportCsv}
        onCreate={canCreate ? () => setEditing(null) : undefined}
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
        onEdit={canEdit ? () => setEditing(selected) : undefined}
        onAdvanceStatus={advanceStatus}
        supportSchedules={selectedSchedules}
        auditLogs={selectedAuditLogs}
        onOverrideSupport={isAdmin ? setOverrideSchedule : undefined}
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
          onClose={() => setOverrideSchedule(null)}
          onConfirm={confirmSupportOverride}
        />
      )}
    </>
  );
}
