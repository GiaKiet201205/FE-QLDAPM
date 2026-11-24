import { apiRequest } from './api';

export const storeChatApi = {
  status: (signal) => apiRequest('/store/chat/status', { skipAuth: true, signal }),
  send: (message, history, signal) => apiRequest('/store/chat/messages', {
    method: 'POST', skipAuth: true, body: JSON.stringify({ message, history }), signal,
  }),
};
