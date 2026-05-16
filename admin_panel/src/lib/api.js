import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// 👨‍🏫 This interceptor automatically attaches your JWT token
// to every request so the backend knows you are a logged-in admin.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
