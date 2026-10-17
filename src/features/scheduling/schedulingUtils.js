export function mondayOf(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  return d;
}
export function iso(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
}
export function addDays(date, count) {
  const result = new Date(date);
  result.setDate(result.getDate() + count);
  return result;
}
export const days = ['mon','tue','wed','thu','fri','sat','sun'];
export const campuses = ['Cơ sở chính','Cơ sở Quận 1','Cơ sở Quận 3'];
export const workplaces = [
  {id:'center-01',label:'Cơ sở chính'}, {id:'center-02',label:'Cơ sở Quận 1'}, {id:'center-03',label:'Cơ sở Quận 3'}
];
export const workTypes = {
  CS: [{value:'CLASS_SUPPORT',label:'Hỗ trợ lớp học'},{value:'OPERATIONS_SUPPORT',label:'Hỗ trợ vận hành'},{value:'FRONT_DESK',label:'Trực quầy'}],
  SALE: [{value:'SALES_SHIFT',label:'Ca tư vấn tuyển sinh'},{value:'LEAD_FOLLOWUP',label:'Chăm sóc lead'},{value:'CONSULTATION',label:'Tư vấn trực tiếp'}]
};
export function slotForWeek(item, week) {
  const date = item.availableDate ? String(item.availableDate).slice(0,10) : '';
  if (date) return date >= iso(week) && date <= iso(addDays(week,6));
  return days.includes(String(item.day).toLowerCase());
}
export function normalizeSlot(slot) {
  return {...slot, day: String(slot.day || '').toLowerCase(), start: String(slot.start || slot.startTime || '').slice(0,5),
    end: String(slot.end || slot.endTime || '').slice(0,5), status:String(slot.status || '').toUpperCase()};
}
