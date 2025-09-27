// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  monthlyBudgetGoal: number;
  preferences: any;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  isSimulated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpendingCap {
  id: string;
  type: 'MERCHANT' | 'CATEGORY' | 'GLOBAL';
  name: string;
  limit: number;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  enabled: boolean;
  category?: string;
  merchant?: string;
  spent?: number;
  percentage?: number;
  remaining?: number;
  status?: 'safe' | 'warning' | 'exceeded';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalSpent: number;
  monthlyBudget: number;
  budgetRemaining: number;
  activeCaps: number;
  lockedCards: number;
  topCategory: string;
  recentTransactions: Transaction[];
  spendingTrend: Array<{
    date: string;
    amount: number;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    monthlyBudgetGoal?: number;
  }) {
    const response = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async getProfile() {
    return this.request<User>('/auth/profile');
  }

  async updateProfile(userData: Partial<User>) {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    this.clearToken();
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Transactions
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    category?: string;
    merchant?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.request<PaginatedResponse<Transaction>>(
      `/transactions?${searchParams.toString()}`
    );
  }

  async createTransaction(transactionData: {
    merchant: string;
    amount: number;
    category: string;
    description?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    isSimulated?: boolean;
  }) {
    return this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async simulateTransaction(transactionData: {
    merchant: string;
    amount: number;
    category: string;
  }) {
    return this.request('/transactions/simulate', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async updateTransaction(id: string, transactionData: Partial<Transaction>) {
    return this.request<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
  }

  async deleteTransaction(id: string) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Spending Caps
  async getSpendingCaps() {
    return this.request<SpendingCap[]>('/caps');
  }

  async createSpendingCap(capData: {
    type: 'MERCHANT' | 'CATEGORY' | 'GLOBAL';
    name: string;
    limit: number;
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    category?: string;
    merchant?: string;
  }) {
    return this.request<SpendingCap>('/caps', {
      method: 'POST',
      body: JSON.stringify(capData),
    });
  }

  async updateSpendingCap(id: string, capData: Partial<SpendingCap>) {
    return this.request<SpendingCap>(`/caps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(capData),
    });
  }

  async toggleSpendingCap(id: string) {
    return this.request<SpendingCap>(`/caps/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  async deleteSpendingCap(id: string) {
    return this.request(`/caps/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getDashboardStats() {
    return this.request<DashboardStats>('/analytics/dashboard');
  }

  async getSpendingTrends(period?: string, groupBy?: string) {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (groupBy) params.append('groupBy', groupBy);

    return this.request(`/analytics/spending-trends?${params.toString()}`);
  }

  async getCategoryBreakdown(period?: string) {
    const params = new URLSearchParams();
    if (period) params.append('period', period);

    return this.request(`/analytics/category-breakdown?${params.toString()}`);
  }

  async getMerchantAnalysis(period?: string, limit?: number) {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (limit) params.append('limit', limit.toString());

    return this.request(`/analytics/merchant-analysis?${params.toString()}`);
  }

  async getInsights() {
    return this.request('/analytics/insights');
  }

  // Map Features
  async getMapMerchants(period?: string) {
    const params = new URLSearchParams();
    if (period) params.append('period', period);

    return this.request(`/map/merchants?${params.toString()}`);
  }

  async getHeatmapData(period?: string) {
    const params = new URLSearchParams();
    if (period) params.append('period', period);

    return this.request(`/map/heatmap-data?${params.toString()}`);
  }

  async getLocationData(period?: string) {
    const params = new URLSearchParams();
    if (period) params.append('period', period);

    return this.request(`/map/locations?${params.toString()}`);
  }

  // Settings
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settings: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getNotificationSettings() {
    return this.request('/settings/notifications');
  }

  async updateNotificationSettings(settings: any) {
    return this.request('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getMapSettings() {
    return this.request('/settings/map');
  }

  async updateMapSettings(settings: any) {
    return this.request('/settings/map', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Utility methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  isAuthenticated() {
    return !!this.token;
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual methods for convenience
export const {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  getTransactions,
  createTransaction,
  simulateTransaction,
  updateTransaction,
  deleteTransaction,
  getSpendingCaps,
  createSpendingCap,
  updateSpendingCap,
  toggleSpendingCap,
  deleteSpendingCap,
  getDashboardStats,
  getSpendingTrends,
  getCategoryBreakdown,
  getMerchantAnalysis,
  getInsights,
  getMapMerchants,
  getHeatmapData,
  getLocationData,
  getSettings,
  updateSettings,
  getNotificationSettings,
  updateNotificationSettings,
  getMapSettings,
  updateMapSettings,
  isAuthenticated,
} = apiClient;
