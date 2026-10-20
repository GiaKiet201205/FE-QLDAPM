import { useCallback, useEffect, useMemo, useState } from "react";
import AvailabilityFormModal from "../features/availability/AvailabilityFormModal";
import AvailabilityView from "../features/availability/AvailabilityView";
import { emptyAvailabilityForm } from "../features/availability/mockAvailability";
import { useAccountData } from "../features/accounts/hooks/useAccountData";
import { schedulingApi } from "../services/api";
import { addDays, days, iso, mondayOf } from "../features/scheduling/schedulingUtils";
import {
  availabilityStatusToUi,
  availabilityTypeToApi,
  availabilityTypeToUi,
  buildWeekDays,
  formatWeekLabel,
  normalizeAvailability,
} from "../features/scheduling/schedulingApiAdapters";

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AvailabilityRegister() {
  const { authUser } = useAccountData();
  const [weekStart, setWeekStart] = useState(() => mondayOf());
  const [slots, setSlots] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);

  const loadAvailability = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const rows = await schedulingApi.mineAvailability(iso(weekStart));
      const next = (Array.isArray(rows) ? rows : []).map((row) => {
        const item = normalizeAvailability(row, authUser?.roleKey);
        return {
          id: item.id,
          day: item.day,
          shift: item.shift,
          start: item.startTime,
          end: item.endTime,
          status: availabilityStatusToUi(item.status),
          type: availabilityTypeToUi(item.availabilityType),
          campus: item.campus,
          note: item.note,
          availableDate: item.availableDate,
          submittedAt: formatDateTime(item.createdAt),
          reviewedAt: formatDateTime(item.reviewedAt),
        };
      });

      setSlots(next);
      setSelectedId((current) =>
        next.some((slot) => slot.id === current) ? current : next[0]?.id || null,
      );
    } catch (requestError) {
      setSlots([]);
      setSelectedId(null);
      setError(requestError?.message || "Không thể tải lịch rảnh.");
    } finally {
      setLoading(false);
    }
  }, [weekStart, authUser?.roleKey]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  async function saveAvailability(form) {
    setError("");
    setActionMessage("");

    const dayIndex = days.indexOf(form.day);
    const body = {
      dayOfWeek: form.day,
      shift: form.shift,
      startTime: form.start,
      endTime: form.end,
      availabilityType: availabilityTypeToApi(form.type),
      availableDate:
        availabilityTypeToApi(form.type) === "WEEKLY" && dayIndex >= 0
          ? iso(addDays(weekStart, dayIndex))
          : null,
      campus: form.campus,
      note: form.note,
    };

    try {
      if (editing) {
        await schedulingApi.updateAvailability(editing.id, body);
        setActionMessage("Đã cập nhật lịch rảnh.");
      } else {
        await schedulingApi.createAvailability(body);
        setActionMessage("Đã gửi lịch rảnh.");
      }

      setEditing(undefined);
      await loadAvailability();
    } catch (requestError) {
      setError(requestError?.message || "Không thể lưu lịch rảnh.");
    }
  }

  async function deleteAvailability(id) {
    const target = slots.find((slot) => slot.id === id);
    if (!target) return;

    const accepted = window.confirm(
      "Xóa lịch rảnh " + target.start + " – " + target.end + "?",
    );
    if (!accepted) return;

    setError("");
    setActionMessage("");

    try {
      await schedulingApi.removeAvailability(id);
      setActionMessage("Đã xóa lịch rảnh.");
      await loadAvailability();
    } catch (requestError) {
      setError(requestError?.message || "Không thể xóa lịch rảnh.");
    }
  }

  function moveWeek(offset) {
    setEditing(undefined);
    setActionMessage("");
    setWeekStart((current) => addDays(current, offset));
  }

  return (
    <>
      <AvailabilityView
        slots={slots}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAdd={() => setEditing(null)}
        onEdit={setEditing}
        onDelete={deleteAvailability}
        onResetDemo={loadAvailability}
        weekDays={weekDays}
        weekLabel={formatWeekLabel(weekStart)}
        onPreviousWeek={() => moveWeek(-7)}
        onNextWeek={() => moveWeek(7)}
        loading={loading}
        error={error}
        actionMessage={actionMessage}
        personName={authUser?.user || authUser?.username || "Tài khoản hiện tại"}
        roleLabel={authUser?.role || authUser?.roleKey || ""}
      />

      {editing !== undefined && (
        <AvailabilityFormModal
          value={editing}
          emptyForm={emptyAvailabilityForm}
          onClose={() => setEditing(undefined)}
          onSave={saveAvailability}
        />
      )}
    </>
  );
}
