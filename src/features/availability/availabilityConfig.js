export const weekDayDefinitions = [
  { key: "mon", label: "T2" },
  { key: "tue", label: "T3" },
  { key: "wed", label: "T4" },
  { key: "thu", label: "T5" },
  { key: "fri", label: "T6" },
  { key: "sat", label: "T7" },
  { key: "sun", label: "CN" },
];

export const shiftDefinitions = [
  { key: "morning", label: "Buổi sáng", range: "08:30 – 11:30" },
  { key: "afternoon", label: "Buổi chiều", range: "14:00 – 17:00" },
  { key: "evening", label: "Buổi tối", range: "18:00 – 21:00" },
];

// Selecting a different shift resets the suggested hours, while edits within
// the same shift and previously saved custom hours remain untouched.
export function applyAvailabilityShift(form, nextShift) {
  if (form.shift === nextShift) return form;
  const definition = shiftDefinitions.find((shift) => shift.key === nextShift);
  if (!definition) return form;

  const [start, end] = definition.range.split(" – ");
  return { ...form, shift: nextShift, start, end };
}

export const emptyAvailabilityForm = {
  day: "mon",
  shift: "morning",
  start: "08:30",
  end: "11:30",
  type: "Lịch rảnh định kỳ",
  campus: "Cơ sở chính",
  note: "",
};

export function getDurationHours(start, end) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  return Math.max(0, (endHour * 60 + endMinute - startHour * 60 - startMinute) / 60);
}
