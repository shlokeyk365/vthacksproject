import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type User, type Transaction, type SpendingCap, type DashboardStats } from '../lib/api';
import toast from 'react-hot-toast';

// Query Keys
export const queryKeys = {
  profile: ['profile'] as const,
  transactions: ['transactions'] as const,
  transactionsList: (params?: any) => ['transactions', 'list', params] as const,
  spendingCaps: ['spendingCaps'] as const,
  dashboard: ['dashboard'] as const,
  spendingTrends: (period?: string) => ['spendingTrends', period] as const,
  categoryBreakdown: (period?: string) => ['categoryBreakdown', period] as const,
  merchantAnalysis: (period?: string, limit?: number) => ['merchantAnalysis', period, limit] as const,
  insights: ['insights'] as const,
  mapMerchants: (period?: string) => ['mapMerchants', period] as const,
  heatmapData: (period?: string) => ['heatmapData', period] as const,
  locationData: (period?: string) => ['locationData', period] as const,
  leaderboard: (period?: string, type?: string) => ['leaderboard', period, type] as const,
  friends: ['friends'] as const,
  settings: ['settings'] as const,
  notificationSettings: ['notificationSettings'] as const,
  mapSettings: ['mapSettings'] as const,
};

// Authentication Hooks
export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => apiClient.getProfile(),
    enabled: apiClient.isAuthenticated(),
    select: (data) => data.data,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.login(data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile, data);
      toast.success('Login successful!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Login failed');
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile, data);
      toast.success('Registration successful!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Registration failed');
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.logout,
    onSuccess: () => {
      queryClient.clear();
      // Don't show toast here - let AuthContext handle it
    },
    onError: (error: any) => {
      // Don't show error toast for logout since it's primarily client-side
      // Just clear the cache and let AuthContext handle the success message
      queryClient.clear();
      console.log('Logout API error (non-critical):', error.message);
    },
  });
};

// Transaction Hooks
export const useTransactions = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.transactionsList(params),
    queryFn: () => apiClient.getTransactions(params),
    select: (data) => data.data,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Transaction created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create transaction');
    },
  });
};

export const useSimulateTransaction = () => {
  return useMutation({
    mutationFn: (data: any) => apiClient.simulateTransaction(data),
    onError: (error: any) => {
      toast.error(error.message || 'Transaction simulation failed');
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Transaction> }) =>
      apiClient.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Transaction updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update transaction');
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Transaction deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete transaction');
    },
  });
};

// Spending Caps Hooks
export const useSpendingCaps = () => {
  return useQuery({
    queryKey: queryKeys.spendingCaps,
    queryFn: () => apiClient.getSpendingCaps(),
    select: (data) => data.data,
  });
};

export const useCreateSpendingCap = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.createSpendingCap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.spendingCaps });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Spending cap created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create spending cap');
    },
  });
};

export const useUpdateSpendingCap = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SpendingCap> }) =>
      apiClient.updateSpendingCap(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.spendingCaps });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Spending cap updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update spending cap');
    },
  });
};

export const useToggleSpendingCap = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.toggleSpendingCap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.spendingCaps });
      toast.success('Spending cap toggled successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to toggle spending cap');
    },
  });
};

export const useDeleteSpendingCap = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.deleteSpendingCap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.spendingCaps });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Spending cap deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete spending cap');
    },
  });
};

export const useCapMerchants = (period?: string) => {
  return useQuery({
    queryKey: ['capMerchants', period],
    queryFn: () => apiClient.getCapMerchants(period),
    select: (data) => data.data,
  });
};

// Analytics Hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => apiClient.getDashboardStats(),
    select: (data) => data.data,
  });
};

export const useSpendingTrends = (period?: string) => {
  return useQuery({
    queryKey: queryKeys.spendingTrends(period),
    queryFn: () => apiClient.getSpendingTrends(period),
    select: (data) => data.data,
  });
};

export const useCategoryBreakdown = (period?: string) => {
  return useQuery({
    queryKey: queryKeys.categoryBreakdown(period),
    queryFn: () => apiClient.getCategoryBreakdown(period),
    select: (data) => data.data,
  });
};

export const useMerchantAnalysis = (period?: string, limit?: number) => {
  return useQuery({
    queryKey: queryKeys.merchantAnalysis(period, limit),
    queryFn: () => apiClient.getMerchantAnalysis(period, limit),
    select: (data) => data.data,
  });
};

export const useInsights = () => {
  return useQuery({
    queryKey: queryKeys.insights,
    queryFn: () => apiClient.getInsights(),
    select: (data) => data.data,
  });
};

// Map Hooks
export const useMapMerchants = (period?: string) => {
  return useQuery({
    queryKey: queryKeys.mapMerchants(period),
    queryFn: () => apiClient.getMapMerchants(period),
    select: (data) => data.data,
  });
};

export const useHeatmapData = (period?: string) => {
  return useQuery({
    queryKey: queryKeys.heatmapData(period),
    queryFn: () => apiClient.getHeatmapData(period),
    select: (data) => data.data,
  });
};

export const useLocationData = (period?: string) => {
  return useQuery({
    queryKey: queryKeys.locationData(period),
    queryFn: () => apiClient.getLocationData(period),
    select: (data) => data.data,
  });
};

// Settings Hooks
export const useSettings = () => {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => apiClient.getSettings(),
    select: (data) => data.data,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      toast.success('Settings updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });
};

export const useNotificationSettings = () => {
  return useQuery({
    queryKey: queryKeys.notificationSettings,
    queryFn: () => apiClient.getNotificationSettings(),
    select: (data) => data.data,
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.updateNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationSettings });
      toast.success('Notification settings updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update notification settings');
    },
  });
};

export const useMapSettings = () => {
  return useQuery({
    queryKey: queryKeys.mapSettings,
    queryFn: () => apiClient.getMapSettings(),
    select: (data) => data.data,
  });
};

export const useUpdateMapSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.updateMapSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mapSettings });
      toast.success('Map settings updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update map settings');
    },
  });
};

// Leaderboard Hooks
export const useLeaderboard = (period?: string, type?: string) => {
  return useQuery({
    queryKey: queryKeys.leaderboard(period, type),
    queryFn: () => apiClient.getLeaderboard(period, type),
    select: (data) => data.data,
  });
};

export const useFriends = () => {
  return useQuery({
    queryKey: queryKeys.friends,
    queryFn: () => apiClient.getFriends(),
    select: (data) => data.data,
  });
};
