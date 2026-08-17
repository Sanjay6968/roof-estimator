import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ownerToken');
  if (token) {
    config.headers.Authorization = `Basic ${token}`;
  }
  return config;
});

export const getConfig = () => api.get('/config');
export const submitEstimate = (data) => api.post('/estimate', data);
export const login = (username, password) => api.post('/auth/login', { username, password });
export const getLeads = () => api.get('/admin/leads');
export const updateConfig = (data) => api.put('/admin/config', data);

export default api;
