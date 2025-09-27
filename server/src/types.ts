export interface Merchant {
  merchant_id: number;
  name: string;
  category: string;
  lat: number;
  lng: number;
}

export interface Transaction {
  txn_id: number;
  merchant_id: number;
  amount: number;
  ts: string;
  category: string;
}

export interface Rule {
  rule_id: number;
  type: 'merchant_cap' | 'category_cap';
  target_id?: number; // merchant_id for merchant caps
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

export interface MerchantWithAggregates {
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

export interface CardLockRequest {
  merchant_id: number;
  locked: boolean;
}
