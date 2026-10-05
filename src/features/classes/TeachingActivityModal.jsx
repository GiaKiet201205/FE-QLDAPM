import { useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function TeachingActivityModal({
  classItem,
  type,
  onClose,
  onSave,
}) {
  const isExam = type === "exam";
  const [form, setForm] = useState(
    isExam
      ? {
          classId: classItem.id,
          title: "",
          description: "",
          duration: 60,
          examDate: "",
        }
      : {
          classId: classItem.id,
          title: "",
          description: "",
          deadline: "",
        },
  );

  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function submit(event) {
    event.preventDefault();
    onSave({
      ...form,
      ...(isExam ? { duration: Number(form.duration) } : {}),
    });
  }

  return (
    <Modal
      title={isExam ? "Create Exam" : "Create Assignment"}
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <form onSubmit={submit} className="grid gap-3.5">
        <label className="grid gap-1.5 text-[13px] font-medium">
          Title
          <input
            className={inputClass}
            name="title"
            value={form.title}
            onChange={update}
            required
            autoFocus
          />
        </label>

        <label className="grid gap-1.5 text-[13px] font-medium">
          Description
          <textarea
            className="min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            name="description"
            value={form.description}
            onChange={update}
          />
        </label>

        {isExam ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[13px] font-medium">
              Exam date
              <input
                className={inputClass}
                type="date"
                name="examDate"
                value={form.examDate}
                onChange={update}
                required
              />
            </label>
            <label className="grid gap-1.5 text-[13px] font-medium">
              Duration (minutes)
              <input
                className={inputClass}
                type="number"
                min="1"
                name="duration"
                value={form.duration}
                onChange={update}
                required
              />
            </label>
          </div>
        ) : (
          <label className="grid gap-1.5 text-[13px] font-medium">
            Deadline
            <input
              className={inputClass}
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={update}
              required
            />
          </label>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">
            {isExam ? "Create Exam" : "Create Assignment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
