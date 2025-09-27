const API_BASE = '/api';

export interface Merchant {
  merchant_id: number;
  name: string;
  category: string;
  lat: number;
  lng: number;
  last30_spend: number;
  mtd_spend: number;
  monthly_budget_left: number;
  over_cap: boolean;
  locked: boolean;
}

export interface TransactionSummary {
  by_category: Array<{
    category: string;
    amount: number;
  }>;
  top_merchants: Array<{
    merchant_id: number;
    name: string;
    amount: number;
  }>;
}

export interface Rule {
  rule_id: number;
  type: 'merchant_cap' | 'category_cap';
  target_id?: number;
  category?: string;
  cap_amount: number;
  window: 'month';
  active: boolean;
}

export interface CardLock {
  merchant_id: number;
  locked: boolean;
  locked_at: string;
}

export interface SimulateTransactionRequest {
  merchant_id: number;
  amount: number;
}

export interface CreateRuleRequest {
  type: 'merchant_cap' | 'category_cap';
  target_id?: number;
  category?: string;
  cap_amount: number;
  window: 'month';
  active: boolean;
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Merchants
  async getNearbyMerchants(lat: number, lng: number, radiusMeters: number = 600): Promise<Merchant[]> {
    return this.request(`/merchants/nearby?lat=${lat}&lng=${lng}&radiusMeters=${radiusMeters}`);
  }

  // Transactions
  async getTransactionSummary(window: string = '30d'): Promise<TransactionSummary> {
    return this.request(`/transactions/summary?window=${window}`);
  }

  async simulateTransaction(data: SimulateTransactionRequest): Promise<any> {
    return this.request('/transactions/simulate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Rules
  async getRules(): Promise<Rule[]> {
    return this.request('/rules');
  }

  async createRule(data: CreateRuleRequest): Promise<Rule> {
    return this.request('/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRule(ruleId: number, data: Partial<CreateRuleRequest>): Promise<void> {
    return this.request(`/rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRule(ruleId: number): Promise<void> {
    return this.request(`/rules/${ruleId}`, {
      method: 'DELETE',
    });
  }

  // Card
  async setCardLock(merchantId: number, locked: boolean): Promise<CardLock> {
    return this.request('/card/lock', {
      method: 'POST',
      body: JSON.stringify({ merchant_id: merchantId, locked }),
    });
  }

  async getCardLocks(): Promise<CardLock[]> {
    return this.request('/card/locks');
  }

  async setOverride(merchantId: number): Promise<void> {
    return this.request('/card/override', {
      method: 'POST',
      body: JSON.stringify({ merchant_id: merchantId }),
    });
  }
}

export const apiClient = new ApiClient();
