import { useSyncExternalStore } from 'react';

const key = 'gk.storefront.cart.v1';
const event = 'gk:cart-changed';
function subscribe(callback) {
  window.addEventListener('storage', callback);
  window.addEventListener(event, callback);
  return () => { window.removeEventListener('storage', callback); window.removeEventListener(event, callback); };
}
function snapshot() { try { return localStorage.getItem(key) || '[]'; } catch { return '[]'; } }
export function readCart() {
  try {
    const rows = JSON.parse(snapshot());
    if (!Array.isArray(rows)) return [];
    const courses = new Map();
    for (const row of rows) {
      if (row && validId(row.courseId) && validId(row.classId)) {
        courses.set(row.courseId, { courseId: row.courseId, classId: row.classId });
      }
    }
    return [...courses.values()];
  } catch { return []; }
}
function write(rows) {
  localStorage.setItem(key, JSON.stringify(rows));
  window.dispatchEvent(new Event(event));
}
export function addToCart(courseId, classId) {
  if (!validId(courseId) || !validId(classId)) throw new Error('Vui lòng chọn lớp học hợp lệ.');
  write([...readCart().filter((r) => r.courseId !== courseId), { courseId, classId }]);
}
export function removeFromCart(courseId) { write(readCart().filter((r) => r.courseId !== courseId)); }
export function useCart() {
  useSyncExternalStore(subscribe, snapshot, () => '[]');
  return readCart();
}

function validId(value) { return typeof value === 'string' && value.length > 0 && value.length <= 50 && /^[a-zA-Z0-9_-]+$/.test(value); }
export function clearGuestCart() { write([]); }
