import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class ApiService {
  // Auth endpoints
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  // Farmer endpoints
  async getFarmerProfile() {
    const response = await api.get('/farmers/profile');
    return response.data;
  }

  async updateFarmerProfile(profileData) {
    const response = await api.put('/farmers/profile', profileData);
    return response.data;
  }

  // Consumer endpoints
  async getConsumerProfile() {
    const response = await api.get('/consumers/profile');
    return response.data;
  }

  async updateConsumerProfile(profileData) {
    const response = await api.put('/consumers/profile', profileData);
    return response.data;
  }
}

export const apiService = new ApiService();