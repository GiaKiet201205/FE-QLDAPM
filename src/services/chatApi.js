import { apiRequest } from './api';

export const chatApi = {
  status: (signal) => apiRequest('/chat/status', { signal }),
  send: (message, history, signal) => apiRequest('/chat/messages', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
    signal,
  }),
};
