import { useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[13px] font-normal text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
export default function StudentFormModal({
  student,
  onClose,
  onSave,
  emptyForm,
}) {
  const [form, setForm] = useState(student ? { ...student } : emptyForm);
  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }
  function submit(event) {
    event.preventDefault();
    onSave(form);
  }

  return (
    <Modal title={student ? "Edit Student" : "Add Student"} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-3.5">
        <label className="grid gap-1.5 text-[13px] font-medium">
          Full name
          <input
            className={inputClass}
            name="name"
            value={form.name}
            onChange={update}
            required
            autoFocus
          />
        </label>
        <label className="grid gap-1.5 text-[13px] font-medium">
          Email
          <input
            className={inputClass}
            name="email"
            type="email"
            value={form.email}
            onChange={update}
            required
          />
        </label>
        <label className="grid gap-1.5 text-[13px] font-medium">
          Phone
          <input
            className={inputClass}
            name="phone"
            value={form.phone}
            onChange={update}
            required
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5 text-[13px] font-medium">
            Course
            <select
              className={inputClass}
              name="course"
              value={form.course}
              onChange={update}
            >
              <option>IELTS</option>
              <option>TOEIC</option>
              <option>SAT</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-[13px] font-medium">
            Status
            <select
              className={inputClass}
              name="status"
              value={form.status}
              onChange={update}
            >
              <option>Active</option>
              <option>On Leave</option>
              <option>Graduated</option>
            </select>
          </label>
        </div>
        <label className="grid gap-1.5 text-[13px] font-medium">
          Class
          <input
            className={inputClass}
            name="className"
            value={form.className}
            onChange={update}
            required
          />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {student ? "Save Changes" : "Add Student"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
