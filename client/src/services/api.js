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
export const login = (username, password) => {
  const token = btoa(`${username}:${password}`);
  return api.post('/auth/login', null, {
    headers: { Authorization: `Basic ${token}` }
  });
};
export const getLeads = () => api.get('/admin/leads');
export const getAdminConfig = () => api.get('/admin/config');
export const updateConfig = (config) => api.put('/admin/config', config);

export default api;
