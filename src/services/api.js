import axios from 'axios';

export const BACKEND_BASE_URL = 'https://teclia-academia-2.onrender.com';
const API_BASE_URL = `${BACKEND_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  signup: (email, password, name) =>
    api.post('/auth/signup', { email, password, name }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  logout: () =>
    api.post('/auth/logout'),
  getCurrentUser: () =>
    api.get('/auth/me'),
  updateProfile: (name, avatar) => {
    if (avatar instanceof FormData) {
      return api.patch('/auth/profile', avatar, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    const payload = {};
    if (name) payload.name = name;
    if (avatar) payload.avatarUrl = avatar;
    return api.patch('/auth/profile', payload);
  },
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (email, pin, newPassword) =>
    api.post('/auth/reset-password', { email, pin, newPassword }),
  verifyRecoveryEmail: (email) =>
    api.post('/auth/verify-recovery-email', { email }),
  getStudents: () =>
    api.get('/auth/students'),
  updateStudentPlan: (studentId, planTier) =>
    api.patch(`/auth/students/${studentId}/plan`, { plan_tier: planTier }),
  deleteStudent: (studentId) =>
    api.delete(`/auth/students/${studentId}`),
};

export const statsService = {
  recordVisit: () => api.post('/stats/visit'),
  getVisitStats: () => api.get('/stats/visits'),
};

export const contentService = {
  getContent: () =>
    api.get('/content'),
  getContentById: (id) =>
    api.get(`/content/${id}`),
  getFreeContent: () =>
    api.get('/content/free'),
};

export default api;
