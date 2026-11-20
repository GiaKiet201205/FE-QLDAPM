import { apiRequest } from "./api";

export function loginRequest(username, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logoutRequest() {
  return apiRequest('/auth/logout', { method: 'POST' });
}

export function registerRequest(body) {
  return apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) });
}

export function currentAccountRequest() {
  return apiRequest('/auth/me');
}

export function socialProvidersRequest() {
  return apiRequest('/auth/social/providers', { skipAuth: true });
}
export function socialStartRequest(provider, challenge, link = false) {
  return apiRequest('/auth/social/start', { method: 'POST', credentials: 'include', skipAuth: !link,
    body: JSON.stringify({ provider, challenge, link }) });
}
export function socialExchangeRequest(code, verifier) {
  return apiRequest('/auth/social/exchange', { method: 'POST', skipAuth: true, body: JSON.stringify({ code, verifier }) });
}
export function socialConnectionsRequest() {
  return apiRequest('/auth/social/connections');
}
