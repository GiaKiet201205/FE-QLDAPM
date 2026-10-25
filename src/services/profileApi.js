import { apiRequest } from './api';

export const profileApi = {
  mine: () => apiRequest('/profile'),
  update: (body) => apiRequest('/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  changePassword: (body) => apiRequest('/profile/password', { method: 'POST', body: JSON.stringify(body) }),
};
