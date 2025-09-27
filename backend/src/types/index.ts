import { Request } from 'express';
import { User, Transaction, SpendingCap, Merchant, Notification } from '@prisma/client';

// Extended Request interface with user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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

// Transaction types
export interface CreateTransactionRequest {
  merchant: string;
  amount: number;
  category: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  isSimulated?: boolean;
}

export interface UpdateTransactionRequest {
  merchant?: string;
  amount?: number;
  category?: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface TransactionFilters {
  category?: string;
  merchant?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}

// Spending Cap types
export interface CreateSpendingCapRequest {
  type: 'MERCHANT' | 'CATEGORY' | 'GLOBAL';
  name: string;
  limit: number;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  category?: string;
  merchant?: string;
}

export interface UpdateSpendingCapRequest {
  name?: string;
  limit?: number;
  period?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  enabled?: boolean;
  category?: string;
  merchant?: string;
}

// Analytics types
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

export interface SpendingTrendData {
  date: string;
  amount: number;
  category?: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MerchantAnalysis {
  name: string;
  amount: number;
  visits: number;
  averageSpent: number;
}

// Map types
export interface MapMerchant {
  id: string;
  name: string;
  address: string;
  totalSpent: number;
  visits: number;
  category: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  averageSpent: number;
  pricingLevel: 'low' | 'medium' | 'high';
}

export interface HeatmapData {
  lat: number;
  lng: number;
  intensity: number;
  amount: number;
}

// Settings types
export interface UserSettings {
  notifications: {
    capAlerts: boolean;
    weeklyReports: boolean;
    budgetWarnings: boolean;
    transactionAlerts: boolean;
  };
  map: {
    defaultLocation: string;
    mapboxToken?: string;
    showHeatmap: boolean;
    showMerchantPins: boolean;
  };
  theme: 'light' | 'dark';
}

// WebSocket event types
export interface SocketEvents {
  'join-user-room': (userId: string) => void;
  'subscribe-cap-alerts': (userId: string) => void;
  'subscribe-transactions': (userId: string) => void;
  'cap-alert': (data: {
    capId: string;
    capName: string;
    spent: number;
    limit: number;
    percentage: number;
  }) => void;
  'transaction-update': (transaction: Transaction) => void;
  'budget-warning': (data: {
    spent: number;
    budget: number;
    percentage: number;
  }) => void;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}
