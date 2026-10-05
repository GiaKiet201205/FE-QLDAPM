import { useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { csUsers, getCsName } from "./mockClassOperations";

const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[13px] font-normal text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function SupportOverrideModal({ schedule, onClose, onConfirm }) {
  const alternatives = csUsers.filter((user) => user.id !== schedule.userId);
  const [newCsId, setNewCsId] = useState(alternatives[0]?.id ?? "");
  const [reason, setReason] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!newCsId || !reason.trim()) return;
    onConfirm({
      scheduleId: schedule.id,
      newCsId,
      reason: reason.trim(),
    });
  }

  return (
    <Modal
      title="Administrative Override"
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <form onSubmit={submit} className="grid gap-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-[13px]">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Current assignment
          </span>
          <strong className="mt-1 block font-medium text-slate-800">
            {getCsName(schedule.userId)}
          </strong>
          <span className="text-xs text-slate-500">
            {schedule.date} · {schedule.startTime}–{schedule.endTime}
          </span>
        </div>

        <label className="grid gap-1.5 text-[13px] font-medium">
          Replacement CS
          <select
            className={inputClass}
            value={newCsId}
            onChange={(event) => setNewCsId(event.target.value)}
            required
          >
            {alternatives.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName} · {user.employeeCode}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-[13px] font-medium">
          Override reason
          <textarea
            className="min-h-24 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] font-normal text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explain why an administrative override is required..."
            required
          />
        </label>

        <p className="text-xs leading-5 text-slate-500">
          Normal CS support assignment belongs to Center Management. This action
          is reserved for administrative intervention and will be recorded in
          the class audit history.
        </p>

        <div className="flex justify-end gap-2">
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!newCsId || !reason.trim()}
          >
            Confirm Override
          </Button>
        </div>
      </form>
    </Modal>
  );
}
