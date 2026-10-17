const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const KEY = 'qldapm.scheduling.session';
export const getSession = () => {
  try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; }
};
export const saveSession = (session) => session ? sessionStorage.setItem(KEY, JSON.stringify(session)) : sessionStorage.removeItem(KEY);
export async function apiRequest(path, options = {}) {
  const token = getSession()?.token;
  const response = await fetch(BASE_URL + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...options.headers }
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.message || ('HTTP ' + response.status));
    error.status = response.status;
    throw error;
  }
  return data;
}
export const login = (username, password) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
export const schedulingApi = {
  employees: (role) => apiRequest('/employees?role=' + encodeURIComponent(role)),
  mineAvailability: (week) => apiRequest('/availabilities/me?weekStart=' + week),
  availability: (role, week) => apiRequest('/availabilities?role=' + role + '&weekStart=' + week),
  createAvailability: (body) => apiRequest('/availabilities', { method:'POST', body:JSON.stringify(body) }),
  updateAvailability: (id, body) => apiRequest('/availabilities/' + encodeURIComponent(id), {method:'PUT',body:JSON.stringify(body)}),
  removeAvailability: (id) => apiRequest('/availabilities/' + encodeURIComponent(id), {method:'DELETE'}),
  reviewAvailability: (id, status) => apiRequest('/availabilities/' + encodeURIComponent(id) + '/review', {method:'PATCH',body:JSON.stringify({status})}),
  teaching: (week) => apiRequest('/teaching-schedules?weekStart=' + week),
  staff: (role, week) => apiRequest('/staff-schedules?role=' + role + '&weekStart=' + week),
  ownSchedule: (week) => apiRequest('/schedules/me?weekStart=' + week),
  assignTeacher: (body) => apiRequest('/teaching-schedules', {method:'POST',body:JSON.stringify(body)}),
  assignStaff: (body) => apiRequest('/staff-schedules', {method:'POST',body:JSON.stringify(body)}),
  cancelTeacher: (id) => apiRequest('/teaching-schedules/' + encodeURIComponent(id), {method:'DELETE'}),
  cancelStaff: (id) => apiRequest('/staff-schedules/' + encodeURIComponent(id), {method:'DELETE'})
};
