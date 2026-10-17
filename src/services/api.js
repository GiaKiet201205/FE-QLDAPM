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
    if (response.status === 401 && path !== '/auth/login') { saveSession(null);window.dispatchEvent(new Event('qldapm:session-expired')); }
    const error = new Error(data?.message || ('HTTP ' + response.status));
    error.status = response.status;
    throw error;
  }
  return data;
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const TOKEN_KEY = "iig_access_token";

export class ApiError extends Error {
  constructor(message, status, body = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest(path, options = {}) {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body != null) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const body =
    response.status === 204
      ? null
      : contentType.includes("application/json")
        ? await response.json()
        : await response.text();

  if (!response.ok) {
    const message =
      body && typeof body === "object" && body.message
        ? body.message
        : typeof body === "string" && body
          ? body
          : `API error: ${response.status}`;

    if (response.status === 401) {
      setAccessToken(null);
      window.dispatchEvent(new Event("iig:unauthorized"));
    }

    throw new ApiError(message, response.status, body);
  }

  return body;
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
