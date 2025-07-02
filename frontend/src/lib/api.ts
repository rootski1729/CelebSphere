import axios, { AxiosResponse } from 'axios';
import { AuthResponse, User, Celebrity, DiscoverResponse, CelebritySuggestion } from '@/types';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on auth page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/')) {
        console.log('401 error - clearing auth and redirecting');
        Cookies.remove('auth_token');
        Cookies.remove('user_data');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on 401
      Cookies.remove('auth_token');
      Cookies.remove('user_data');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (email: string, password: string, role: 'celebrity' | 'fan'): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/api/auth/register', {
      email,
      password,
      role,
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response: AxiosResponse<User> = await api.get('/api/auth/profile');
    return response.data;
  },
};

// AI API
export const aiApi = {
  discoverCelebrity: async (description: string): Promise<DiscoverResponse> => {
    const response: AxiosResponse<DiscoverResponse> = await api.post('/api/ai/discover-celebrity', {
      description,
    });
    return response.data;
  },
};

// Celebrity API
export const celebrityApi = {
  getAll: async (page: number = 1, limit: number = 20) => {
    const response = await api.get(`/api/celebrities?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string): Promise<Celebrity> => {
    const response: AxiosResponse<Celebrity> = await api.get(`/api/celebrities/${id}`);
    return response.data;
  },

  createFromAi: async (suggestion: CelebritySuggestion): Promise<Celebrity> => {
    const response: AxiosResponse<Celebrity> = await api.post('/api/celebrities/from-ai', suggestion);
    return response.data;
  },

  follow: async (celebrityId: string): Promise<{ message: string }> => {
    const response = await api.post(`/api/celebrities/${celebrityId}/follow`);
    return response.data;
  },

  unfollow: async (celebrityId: string): Promise<{ message: string }> => {
    const response = await api.post(`/api/celebrities/${celebrityId}/unfollow`);
    return response.data;
  },

  getFanDashboard: async () => {
    const response = await api.get('/api/celebrities/fan/dashboard');
    return response.data;
  },

  downloadPdf: async (celebrityId: string): Promise<Blob> => {
    const response = await api.get(`/api/celebrities/${celebrityId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;