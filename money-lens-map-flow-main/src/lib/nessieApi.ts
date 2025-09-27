// Capital One Nessie API Integration
// Documentation: http://api.nessieisreal.com/

const NESSIE_API_BASE = 'http://api.nessieisreal.com';
const API_KEY = import.meta.env.VITE_NESSIE_API_KEY || 'demo-key';

// Check if Nessie API is properly configured
export const isNessieConfigured = () => {
  return import.meta.env.VITE_NESSIE_API_KEY && import.meta.env.VITE_NESSIE_API_KEY !== 'your-api-key-here';
};

export interface NessieCustomer {
  _id: string;
  first_name: string;
  last_name: string;
  address: {
    street_number: string;
    street_name: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface NessieAccount {
  _id: string;
  type: string;
  nickname: string;
  rewards: number;
  balance: number;
  customer_id: string;
}

export interface NessieTransaction {
  _id: string;
  type: string;
  transaction_date: string;
  status: string;
  payee_id: string;
  medium: string;
  amount: number;
  description: string;
}

export interface NessieBill {
  _id: string;
  status: string;
  payee: string;
  nickname: string;
  payment_date: string;
  recurring_date: number;
  payment_amount: number;
  account_id: string;
}

export interface NessieATM {
  _id: string;
  name: string;
  language_list: string[];
  hours: string[];
  accessibility: boolean;
  amount_left: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: {
    street_number: string;
    street_name: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface NessieBranch {
  _id: string;
  name: string;
  hours: string[];
  phone_number: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: {
    street_number: string;
    street_name: string;
    city: string;
    state: string;
    zip: string;
  };
}

class NessieApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = NESSIE_API_BASE;
    this.apiKey = API_KEY;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}?key=${this.apiKey}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Nessie API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Nessie API Request Failed:', error);
      throw error;
    }
  }

  // Customer Endpoints
  async getCustomers(): Promise<NessieCustomer[]> {
    return this.request<NessieCustomer[]>('/customers');
  }

  async getCustomer(customerId: string): Promise<NessieCustomer> {
    return this.request<NessieCustomer>(`/customers/${customerId}`);
  }

  async createCustomer(customerData: Partial<NessieCustomer>): Promise<NessieCustomer> {
    return this.request<NessieCustomer>('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  // Account Endpoints
  async getAccounts(customerId: string): Promise<NessieAccount[]> {
    return this.request<NessieAccount[]>(`/customers/${customerId}/accounts`);
  }

  async getAccount(accountId: string): Promise<NessieAccount> {
    return this.request<NessieAccount>(`/accounts/${accountId}`);
  }

  async createAccount(customerId: string, accountData: Partial<NessieAccount>): Promise<NessieAccount> {
    return this.request<NessieAccount>(`/customers/${customerId}/accounts`, {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  }

  // Transaction Endpoints
  async getTransactions(accountId: string): Promise<NessieTransaction[]> {
    return this.request<NessieTransaction[]>(`/accounts/${accountId}/transactions`);
  }

  async createTransaction(accountId: string, transactionData: Partial<NessieTransaction>): Promise<NessieTransaction> {
    return this.request<NessieTransaction>(`/accounts/${accountId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async transferMoney(fromAccountId: string, toAccountId: string, amount: number, description: string): Promise<NessieTransaction> {
    return this.request<NessieTransaction>(`/accounts/${fromAccountId}/transfers/accounts/${toAccountId}`, {
      method: 'POST',
      body: JSON.stringify({
        medium: 'balance',
        amount,
        description,
      }),
    });
  }

  // Bill Endpoints
  async getBills(accountId: string): Promise<NessieBill[]> {
    return this.request<NessieBill[]>(`/accounts/${accountId}/bills`);
  }

  async createBill(accountId: string, billData: Partial<NessieBill>): Promise<NessieBill> {
    return this.request<NessieBill>(`/accounts/${accountId}/bills`, {
      method: 'POST',
      body: JSON.stringify(billData),
    });
  }

  async payBill(billId: string, accountId: string): Promise<NessieTransaction> {
    return this.request<NessieTransaction>(`/accounts/${accountId}/bills/${billId}`, {
      method: 'PUT',
    });
  }

  // Enterprise Endpoints (ATM and Branch Locations)
  async getATMs(): Promise<NessieATM[]> {
    return this.request<NessieATM[]>('/enterprise/atms');
  }

  async getBranches(): Promise<NessieBranch[]> {
    return this.request<NessieBranch[]>('/enterprise/branches');
  }

  async getATMsByLocation(lat: number, lng: number, radius: number = 10): Promise<NessieATM[]> {
    const atms = await this.getATMs();
    return atms.filter(atm => {
      const distance = this.calculateDistance(lat, lng, atm.coordinates.lat, atm.coordinates.lng);
      return distance <= radius;
    });
  }

  async getBranchesByLocation(lat: number, lng: number, radius: number = 10): Promise<NessieBranch[]> {
    const branches = await this.getBranches();
    return branches.filter(branch => {
      const distance = this.calculateDistance(lat, lng, branch.coordinates.lat, branch.coordinates.lng);
      return distance <= radius;
    });
  }

  // Utility Methods
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Enhanced Financial Analysis Methods
  async getSpendingAnalysis(customerId: string, days: number = 30): Promise<{
    totalSpent: number;
    averageDaily: number;
    categoryBreakdown: Record<string, number>;
    topMerchants: Array<{ merchant: string; amount: number; count: number }>;
    spendingTrend: Array<{ date: string; amount: number }>;
  }> {
    const accounts = await this.getAccounts(customerId);
    const allTransactions: NessieTransaction[] = [];

    for (const account of accounts) {
      const transactions = await this.getTransactions(account._id);
      allTransactions.push(...transactions);
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentTransactions = allTransactions.filter(t => 
      new Date(t.transaction_date) >= cutoffDate && t.amount > 0
    );

    const totalSpent = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averageDaily = totalSpent / days;

    // Category breakdown (simplified - would need merchant categorization)
    const categoryBreakdown: Record<string, number> = {};
    recentTransactions.forEach(t => {
      const category = this.categorizeTransaction(t.description);
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + t.amount;
    });

    // Top merchants
    const merchantMap = new Map<string, { amount: number; count: number }>();
    recentTransactions.forEach(t => {
      const merchant = t.payee_id || 'Unknown';
      const existing = merchantMap.get(merchant);
      if (existing) {
        existing.amount += t.amount;
        existing.count += 1;
      } else {
        merchantMap.set(merchant, { amount: t.amount, count: 1 });
      }
    });

    const topMerchants = Array.from(merchantMap.entries())
      .map(([merchant, data]) => ({ merchant, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // Spending trend by day
    const spendingTrend: Array<{ date: string; amount: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTransactions = recentTransactions.filter(t => 
        t.transaction_date.startsWith(dateStr)
      );
      
      const dayTotal = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      spendingTrend.push({ date: dateStr, amount: dayTotal });
    }

    return {
      totalSpent,
      averageDaily,
      categoryBreakdown,
      topMerchants,
      spendingTrend
    };
  }

  private categorizeTransaction(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('restaurant') || desc.includes('food') || desc.includes('coffee') || desc.includes('starbucks')) {
      return 'Dining';
    }
    if (desc.includes('gas') || desc.includes('fuel') || desc.includes('uber') || desc.includes('lyft')) {
      return 'Transport';
    }
    if (desc.includes('amazon') || desc.includes('target') || desc.includes('walmart') || desc.includes('shopping')) {
      return 'Shopping';
    }
    if (desc.includes('electric') || desc.includes('water') || desc.includes('internet') || desc.includes('phone')) {
      return 'Utilities';
    }
    if (desc.includes('medical') || desc.includes('pharmacy') || desc.includes('doctor')) {
      return 'Healthcare';
    }
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('entertainment')) {
      return 'Entertainment';
    }
    if (desc.includes('grocery') || desc.includes('food') || desc.includes('supermarket')) {
      return 'Groceries';
    }
    
    return 'Other';
  }
}

// Export singleton instance
export const nessieApi = new NessieApiClient();

// Export types for use in components
export type {
  NessieCustomer,
  NessieAccount,
  NessieTransaction,
  NessieBill,
  NessieATM,
  NessieBranch
};
