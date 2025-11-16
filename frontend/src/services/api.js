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

  // Product endpoints
  async getFarmerProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/farmer/products?${queryString}`);
    return response.data;
  }

  async getFarmerProduct(productId) {
  const response = await api.get(`/farmer/products/${productId}`);
  return response.data;
}

  async createProduct(productData) {
    const response = await api.post('/farmer/products', productData);
    return response.data;
  }

  async updateProduct(productId, productData) {
    const response = await api.put(`/farmer/products/${productId}`, productData);
    return response.data;
  }

  async updateProductStock(productId, stock) {
    const response = await api.patch(`/farmer/products/${productId}/stock`, { stock });
    return response.data;
  }

  async deleteProduct(productId) {
    const response = await api.delete(`/farmer/products/${productId}`);
    return response.data;
  }

  async getProductStats() {
    const response = await api.get('/farmer/products/stats');
    return response.data;
  }

  // Order endpoints
  async getFarmerOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/farmer/orders?${queryString}`);
    return response.data;
  }

  async getFarmerOrder(orderId) {
    const response = await api.get(`/farmer/orders/${orderId}`);
    return response.data;
  }

  async updateOrderStatus(orderId, status, notes = '') {
    const response = await api.patch(`/farmer/orders/${orderId}/status`, { 
      status, 
      notes 
    });
    return response.data;
  }

  async updateOrderNotes(orderId, notes) {
    const response = await api.patch(`/farmer/orders/${orderId}/notes`, { notes });
    return response.data;
  }

  async getOrderStats() {
    const response = await api.get('/farmer/orders/stats');
    return response.data;
  }

  async getOrderCounts() {
    const response = await api.get('/farmer/orders/counts');
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardStats() {
    const response = await api.get('/farmer/dashboard/stats');
    return response.data;
  }

  async getTopProducts(limit = 5, period = 'month') {
    const response = await api.get(`/farmer/dashboard/top-products?limit=${limit}&period=${period}`);
    return response.data;
  }

  async getRecentActivity(limit = 10) {
    const response = await api.get(`/farmer/dashboard/recent-activity?limit=${limit}`);
    return response.data;
  }

  async getSalesChart(period = 'month') {
    const response = await api.get(`/farmer/dashboard/sales-chart?period=${period}`);
    return response.data;
  }

  async getDashboardOverview() {
    const response = await api.get('/farmer/dashboard/overview');
    return response.data;
  }
}

export const apiService = new ApiService();