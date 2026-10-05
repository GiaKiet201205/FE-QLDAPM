import { useMemo, useState } from "react";
import AvailabilityFormModal from "../features/availability/AvailabilityFormModal";
import AvailabilityView from "../features/availability/AvailabilityView";
import {
  emptyAvailabilityForm,
  initialAvailability,
} from "../features/availability/mockAvailability";

export default function AvailabilityRegister() {
  const initial = useMemo(
    () => initialAvailability.map((slot) => ({ ...slot })),
    [],
  );
  const [slots, setSlots] = useState(initial);
  const [selectedId, setSelectedId] = useState(initial[0]?.id || null);
  const [editing, setEditing] = useState(undefined);

  function saveAvailability(form) {
    if (editing) {
      setSlots((current) =>
        current.map((slot) =>
          slot.id === editing.id
            ? {
                ...slot,
                ...form,
                status: "pending",
                reviewedAt: "",
                submittedAt: "Vừa cập nhật",
              }
            : slot,
        ),
      );
      setSelectedId(editing.id);
    } else {
      const newSlot = {
        ...form,
        id: "slot-" + form.day + "-" + form.shift + "-" + Date.now(),
        status: "pending",
        submittedAt: "Vừa gửi",
        reviewedAt: "",
      };
      setSlots((current) => [
        ...current.filter(
          (slot) => !(slot.day === form.day && slot.shift === form.shift),
        ),
        newSlot,
      ]);
      setSelectedId(newSlot.id);
    }
    setEditing(undefined);
  }

  function deleteAvailability(id) {
    const target = slots.find((slot) => slot.id === id);
    if (!target) return;
    const accepted = window.confirm(
      "Xóa lịch rảnh " +
        target.start +
        " – " +
        target.end +
        "? Hành động này chỉ áp dụng trên dữ liệu demo giao diện.",
    );
    if (!accepted) return;
    setSlots((current) => current.filter((slot) => slot.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }

  function resetDemo() {
    const next = initialAvailability.map((slot) => ({ ...slot }));
    setSlots(next);
    setSelectedId(next[0]?.id || null);
    setEditing(undefined);
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
        onResetDemo={resetDemo}
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
