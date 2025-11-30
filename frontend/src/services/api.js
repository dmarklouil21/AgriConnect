import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000/api';agriconnect-api.up.railway.app
const API_BASE_URL = 'https://agriconnect-api.up.railway.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for multipart/form-data - let browser set it automatically
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
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
    // const token = localStorage.getItem('token');
    // const response = await api.post('/farmer/products', productData, {
    //   headers: { 
    //     'Content-Type': 'multipart/form-data',
    //     'Authorization': `Bearer ${token}`
    //   }
    // });
    // return response.data;
    const response = await api.post('/farmer/products', productData);
    return response.data;
  }

  async updateProduct(productId, productData) {
    // const token = localStorage.getItem('token');
    // const response = await api.put(`/farmer/products/${productId}`, productData, {
    //   headers: { 
    //     'Content-Type': 'multipart/form-data',
    //     'Authorization': `Bearer ${token}`
    //    }
    // });
    // return response.data;
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

  async uploadProductImage(formData) {
    const response = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

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
    const response = await api.get('/farmer/products/stats'); // Updated to point to product stats which serves as dashboard stats
    return response.data;
  }

  // UPDATED: Now points to the correct route for Top Produce
  async getTopProducts(limit = 5) {
    const response = await api.get(`/farmer/products/top?limit=${limit}`);
    return response.data;
  }

  async getRecentActivity(limit = 10) {
    // Note: Ensure you have a backend route for this, currently it might fail if not implemented
    // Often dashboard stats covers this, or you need a specific activity log endpoint
    try {
        const response = await api.get(`/farmer/dashboard/recent-activity?limit=${limit}`);
        return response.data;
    } catch (error) {
        return []; // Fallback if endpoint doesn't exist yet
    }
  }

  async getSalesChart(period = 'month') {
    try {
        const response = await api.get(`/farmer/dashboard/sales-chart?period=${period}`);
        return response.data;
    } catch (error) {
        return [];
    }
  }

  async getDashboardOverview() {
    const response = await api.get('/farmer/dashboard/overview');
    return response.data;
  }

  // Consumer Product Endpoints
  async getProducts() {
    const response = await api.get(`/products`);
    return response.data;
  }

  async getProduct(productId) {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  }

  // Add to cart 
  async addToCart(productId, quantity) {
    const response = await api.post('/consumer/add-cart', { productId, quantity });
    return response.data;
  }

  // Get cart
  async getCart() {
    const response = await api.get('/consumer/get-cart');
    return response.data;
  }

  // Update cart item quantity
  async updateCart(productId, quantity) {
    const response = await api.put('/consumer/update-cart', { productId, quantity });
    return response.data;
  }

  // Remove item from cart
  async removeFromCart(productId) {
    const response = await api.delete(`/consumer/remove-cart/${productId}`);
    return response.data;
  }

  // Checkout
  async checkout(shippingAddress, paymentMethod, cartId) {
    const response = await api.post('/consumer/cart/checkout', {shippingAddress, paymentMethod, cartId});
    return response.data;
  }

  // Consumer Order Endpoints
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  }

  async getConsumerOrders() {
    const response = await api.get(`/consumer/orders`);
    return response.data;
  }

  async getConsumerOrder(orderId) {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  }

  async cancelOrder(orderId) {
    const response = await api.put(`/consumer/orders/${orderId}/cancel`);
    return response.data;
  }

  // Reviews Endpoints
  async addReview({productId, orderId, rating, comment}) {
    const response = await api.post('/add/reviews', { productId, orderId, rating, comment });
    return response.data;
  }

  async getProductReviews(productId) {
    const response = await api.get(`/reviews/${productId}`);
    return response.data;
  }

  // Admin Endpoints
  async getAllUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/users?${queryString}`);
    return response.data;
  }

  async updateUserStatus(userId, status) {
    const response = await api.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  }

  async createUser(userData) {
    const response = await api.post('/admin/users/create', userData);
    return response.data;
  }

  async getUserStats() {
    const response = await api.get('/admin/users/stats');
    return response.data;
  }

  // Admin Product Endpoints
  async getAllProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/products?${queryString}`);
    return response.data;
  }

  async updateProductStatus(productId, status, rejectionReason = '') {
    const response = await api.patch(`/admin/products/${productId}/status`, { status, rejectionReason });
    return response.data;
  }

  // Admin Report Endpoints
  async getReportStats() {
    const response = await api.get('/admin/reports/stats');
    return response.data;
  }

  async getReports() {
    const response = await api.get('/admin/reports');
    return response.data;
  }

  async generateReport(type, name) {
    const response = await api.post('/admin/reports/generate', {type, name}); 
    return response.data;
  }
}

export const apiService = new ApiService();