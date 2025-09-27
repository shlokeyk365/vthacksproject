import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nessieApi, type NessieCustomer, type NessieAccount, type NessieTransaction, type NessieBill, type NessieATM, type NessieBranch } from '../lib/nessieApi';

// Query Keys
export const nessieQueryKeys = {
  customers: ['nessie', 'customers'] as const,
  customer: (id: string) => ['nessie', 'customers', id] as const,
  accounts: (customerId: string) => ['nessie', 'accounts', customerId] as const,
  account: (id: string) => ['nessie', 'accounts', id] as const,
  transactions: (accountId: string) => ['nessie', 'transactions', accountId] as const,
  bills: (accountId: string) => ['nessie', 'bills', accountId] as const,
  atms: ['nessie', 'atms'] as const,
  branches: ['nessie', 'branches'] as const,
  spendingAnalysis: (customerId: string, days?: number) => ['nessie', 'spending', customerId, days] as const,
};

// Customer Hooks
export const useNessieCustomers = () => {
  return useQuery({
    queryKey: nessieQueryKeys.customers,
    queryFn: () => nessieApi.getCustomers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useNessieCustomer = (customerId: string) => {
  return useQuery({
    queryKey: nessieQueryKeys.customer(customerId),
    queryFn: () => nessieApi.getCustomer(customerId),
    enabled: !!customerId,
  });
};

export const useCreateNessieCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (customerData: Partial<NessieCustomer>) => 
      nessieApi.createCustomer(customerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nessieQueryKeys.customers });
    },
  });
};

// Account Hooks
export const useNessieAccounts = (customerId: string) => {
  return useQuery({
    queryKey: nessieQueryKeys.accounts(customerId),
    queryFn: () => nessieApi.getAccounts(customerId),
    enabled: !!customerId,
  });
};

export const useNessieAccount = (accountId: string) => {
  return useQuery({
    queryKey: nessieQueryKeys.account(accountId),
    queryFn: () => nessieApi.getAccount(accountId),
    enabled: !!accountId,
  });
};

export const useCreateNessieAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, accountData }: { customerId: string; accountData: Partial<NessieAccount> }) =>
      nessieApi.createAccount(customerId, accountData),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: nessieQueryKeys.accounts(customerId) });
    },
  });
};

// Transaction Hooks
export const useNessieTransactions = (accountId: string) => {
  return useQuery({
    queryKey: nessieQueryKeys.transactions(accountId),
    queryFn: () => nessieApi.getTransactions(accountId),
    enabled: !!accountId,
  });
};

export const useCreateNessieTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ accountId, transactionData }: { accountId: string; transactionData: Partial<NessieTransaction> }) =>
      nessieApi.createTransaction(accountId, transactionData),
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({ queryKey: nessieQueryKeys.transactions(accountId) });
      queryClient.invalidateQueries({ queryKey: nessieQueryKeys.account(accountId) });
    },
  });
};

export const useTransferMoney = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ fromAccountId, toAccountId, amount, description }: {
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      description: string;
    }) => nessieApi.transferMoney(fromAccountId, toAccountId, amount, description),
    onSuccess: (_, { fromAccountId, toAccountId }) => {
      queryClient.invalidateQueries({ queryKey: nessieQueryKeys.account(fromAccountId) });
      queryClient.invalidateQueries({ queryKey: nessieQueryKeys.account(toAccountId) });
      queryClient.invalidateQueries({ queryKey: nessieQueryKeys.transactions(fromAccountId) });
      queryClient.invalidateQueries({ queryKey: nessieQueryKeys.transactions(toAccountId) });
    },
  });
};

// Bill Hooks
export const useNessieBills = (accountId: string) => {
  return useQuery({
    queryKey: nessieQueryKeys.bills(accountId),
    queryFn: () => nessieApi.getBills(accountId),
    enabled: !!accountId,
  });
};

export const useCreateNessieBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ accountId, billData }: { accountId: string; billData: Partial<NessieBill> }) =>
      nessieApi.createBill(accountId, billData),
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({ queryKey: nessieQueryKeys.bills(accountId) });
    },
  });
};

export const usePayBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ billId, accountId }: { billId: string; accountId: string }) =>
      nessieApi.payBill(billId, accountId),
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({ queryKey: nessieQueryKeys.bills(accountId) });
      queryClient.invalidateQueries({ queryKey: nessieQueryKeys.account(accountId) });
      queryClient.invalidateQueries({ queryKey: nessieQueryKeys.transactions(accountId) });
    },
  });
};

// Location Hooks
export const useNessieATMs = () => {
  return useQuery({
    queryKey: nessieQueryKeys.atms,
    queryFn: () => nessieApi.getATMs(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useNessieBranches = () => {
  return useQuery({
    queryKey: nessieQueryKeys.branches,
    queryFn: () => nessieApi.getBranches(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useNessieATMsByLocation = (lat: number, lng: number, radius: number = 10) => {
  return useQuery({
    queryKey: [...nessieQueryKeys.atms, 'location', lat, lng, radius],
    queryFn: () => nessieApi.getATMsByLocation(lat, lng, radius),
    enabled: !!(lat && lng),
  });
};

export const useNessieBranchesByLocation = (lat: number, lng: number, radius: number = 10) => {
  return useQuery({
    queryKey: [...nessieQueryKeys.branches, 'location', lat, lng, radius],
    queryFn: () => nessieApi.getBranchesByLocation(lat, lng, radius),
    enabled: !!(lat && lng),
  });
};

// Financial Analysis Hooks
export const useNessieSpendingAnalysis = (customerId: string, days: number = 30) => {
  return useQuery({
    queryKey: nessieQueryKeys.spendingAnalysis(customerId, days),
    queryFn: () => nessieApi.getSpendingAnalysis(customerId, days),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Utility hook for getting all customer data
export const useNessieCustomerData = (customerId: string) => {
  const customer = useNessieCustomer(customerId);
  const accounts = useNessieAccounts(customerId);
  const spendingAnalysis = useNessieSpendingAnalysis(customerId);

  return {
    customer,
    accounts,
    spendingAnalysis,
    isLoading: customer.isLoading || accounts.isLoading || spendingAnalysis.isLoading,
    error: customer.error || accounts.error || spendingAnalysis.error,
  };
};
