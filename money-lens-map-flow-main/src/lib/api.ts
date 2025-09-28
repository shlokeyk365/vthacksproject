// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://superconfidently-preallowable-wilber.ngrok-free.dev/api';

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
    console.log('API Client initialized with baseURL:', baseURL);
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

    console.log('API Request:', { url, config });

    try {
      const response = await fetch(url, config);
      console.log('API Response:', { status: response.status, statusText: response.statusText });
      
      const data = await response.json();
      console.log('API Data:', data);

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
      console.log('Token set after registration:', response.data.token);
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
      console.log('Token set after login:', response.data.token);
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

  async changePassword(passwordData: { currentPassword: string; newPassword: string }) {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // 2FA methods
  async setup2FA() {
    return this.request<{ secret: string; qrCode: string; manualEntryKey: string }>('/auth/2fa/setup', {
      method: 'POST',
    });
  }

  async verify2FASetup(token: string) {
    return this.request<{ message: string }>('/auth/2fa/verify-setup', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async disable2FA(token: string) {
    return this.request<{ message: string }>('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async get2FAStatus() {
    return this.request<{ enabled: boolean }>('/auth/2fa/status');
  }

  // Data management methods
  async exportData() {
    return this.request<any>('/data/export');
  }

  async importData(importData: any) {
    return this.request<{ message: string }>('/data/import', {
      method: 'POST',
      body: JSON.stringify({ importData }),
    });
  }

  async deleteAllData() {
    return this.request<{ message: string }>('/data/delete-all', {
      method: 'DELETE',
    });
  }

  async getDataStats() {
    return this.request<{
      totalTransactions: number;
      activeCaps: number;
      totalNotifications: number;
      accountAgeDays: number;
      monthlyBudgetGoal: number;
    }>('/data/stats');
  }

  async logout() {
    try {
      // Try to make the logout request, but don't fail if it doesn't work
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Log the error but don't throw it - logout is primarily client-side
      console.log('Logout request failed (non-critical):', error);
    } finally {
      // Always clear the token regardless of request success/failure
      this.token = null;
      localStorage.removeItem('authToken');
    }
    
    // Return a successful response since logout is primarily client-side
    return {
      success: true,
      message: 'Logout successful'
    };
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
    location?: string;
    latitude?: number;
    longitude?: number;
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

  async searchTransactions(query: string, limit?: number) {
    const params = new URLSearchParams();
    params.append('q', query);
    if (limit) params.append('limit', limit.toString());

    return this.request<{ 
      transactions: Transaction[];
      searchQuery: string;
      filters: any;
      generalTerms: string[];
    }>(
      `/transactions/search?${params.toString()}`
    );
  }

  // Spending Caps
  getSpendingCaps = async () => {
    return this.request<SpendingCap[]>('/caps');
  }

  createSpendingCap = async (capData: {
    type: 'MERCHANT' | 'CATEGORY' | 'GLOBAL';
    name: string;
    limit: number;
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    category?: string;
    merchant?: string;
  }) => {
    return this.request<SpendingCap>('/caps', {
      method: 'POST',
      body: JSON.stringify(capData),
    });
  }

  updateSpendingCap = async (id: string, capData: Partial<SpendingCap>) => {
    return this.request<SpendingCap>(`/caps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(capData),
    });
  }

  toggleSpendingCap = async (id: string) => {
    return this.request<SpendingCap>(`/caps/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  deleteSpendingCap = async (id: string) => {
    return this.request(`/caps/${id}`, {
      method: 'DELETE',
    });
  }

  getCapMerchants = async (period?: string) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);

    return this.request<Array<{
      name: string;
      totalSpent: number;
      transactionCount: number;
      averageSpent: number;
    }>>(`/caps/merchants?${params.toString()}`);
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

  // Leaderboard
  async getLeaderboard(period?: string, type?: string) {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (type) params.append('type', type);

    return this.request(`/leaderboard?${params.toString()}`);
  }

  async getFriends() {
    return this.request('/leaderboard/friends');
  }

  // Bank Integration (Mock)
  async getAvailableBanks() {
    return this.request('/plaid/banks');
  }

  async connectBank(bankId: string) {
    return this.request('/plaid/connect', {
      method: 'POST',
      body: JSON.stringify({ bankId }),
    });
  }

  async getPlaidTransactions(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.request(`/plaid/transactions?${params.toString()}`);
  }

  async getPlaidAccounts() {
    return this.request('/plaid/accounts');
  }

  async removePlaidConnection() {
    return this.request('/plaid/connection', {
      method: 'DELETE',
    });
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
    console.log('Token stored in localStorage:', token);
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
  searchTransactions,
  getSpendingCaps,
  createSpendingCap,
  updateSpendingCap,
  toggleSpendingCap,
  deleteSpendingCap,
  getCapMerchants,
  getDashboardStats,
  getSpendingTrends,
  getCategoryBreakdown,
  getMerchantAnalysis,
  getInsights,
  getMapMerchants,
  getHeatmapData,
  getLocationData,
  getLeaderboard,
  getFriends,
  getSettings,
  updateSettings,
  getNotificationSettings,
  updateNotificationSettings,
  getMapSettings,
  updateMapSettings,
  isAuthenticated,
} = apiClient;
