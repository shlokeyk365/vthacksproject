import { DatabaseManager } from '../db';
import { MerchantWithAggregates, TransactionSummary } from '../types';

export class AggregatesService {
  constructor(private db: DatabaseManager) {}

  async getMerchantsWithAggregates(lat: number, lng: number, radiusMeters: number = 600): Promise<MerchantWithAggregates[]> {
    const conn = this.db.getConnection();
    
    // Get merchants within radius (simplified distance calculation)
    const query = `
      SELECT 
        m.merchant_id,
        m.name,
        m.category,
        m.lat,
        m.lng,
        COALESCE(last30.last30_spend, 0) as last30_spend,
        COALESCE(mtd.mtd_spend, 0) as mtd_spend,
        COALESCE(merchant_cap.cap_amount, 0) as merchant_cap_amount,
        COALESCE(category_cap.cap_amount, 0) as category_cap_amount,
        COALESCE(cl.locked, false) as locked
      FROM merchants m
      LEFT JOIN (
        SELECT 
          merchant_id,
          SUM(amount) as last30_spend
        FROM transactions 
        WHERE ts >= date('now', '-30 days')
        GROUP BY merchant_id
      ) last30 ON m.merchant_id = last30.merchant_id
      LEFT JOIN (
        SELECT 
          merchant_id,
          SUM(amount) as mtd_spend
        FROM transactions 
        WHERE ts >= date('now', 'start of month')
        GROUP BY merchant_id
      ) mtd ON m.merchant_id = mtd.merchant_id
      LEFT JOIN rules merchant_cap ON m.merchant_id = merchant_cap.target_id 
        AND merchant_cap.type = 'merchant_cap' 
        AND merchant_cap.active = true
      LEFT JOIN rules category_cap ON m.category = category_cap.category 
        AND category_cap.type = 'category_cap' 
        AND category_cap.active = true
      LEFT JOIN card_locks cl ON m.merchant_id = cl.merchant_id
      WHERE ABS(m.lat - ${lat}) < 0.01 AND ABS(m.lng - ${lng}) < 0.01
    `;

    return new Promise((resolve, reject) => {
      conn.all(query, (err: any, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        const results = rows.map(row => {
          const merchantCap = row.merchant_cap_amount || 0;
          const categoryCap = row.category_cap_amount || 0;
          const effectiveCap = merchantCap > 0 ? merchantCap : categoryCap;
          const monthlyBudgetLeft = Math.max(0, effectiveCap - row.mtd_spend);
          const overCap = effectiveCap > 0 && row.mtd_spend >= effectiveCap;

          return {
            merchant_id: row.merchant_id,
            name: row.name,
            category: row.category,
            lat: row.lat,
            lng: row.lng,
            last30_spend: row.last30_spend,
            mtd_spend: row.mtd_spend,
            monthly_budget_left: monthlyBudgetLeft,
            over_cap: overCap,
            locked: row.locked
          };
        });

        resolve(results);
      });
    });
  }

  async getTransactionSummary(window: string = '30d'): Promise<TransactionSummary> {
    const conn = this.db.getConnection();
    
    let dateFilter = '';
    if (window === '30d') {
      dateFilter = "WHERE ts >= date('now', '-30 days')";
    } else if (window === '90d') {
      dateFilter = "WHERE ts >= date('now', '-90 days')";
    }

    const byCategoryQuery = `
      SELECT 
        category,
        SUM(amount) as amount
      FROM transactions 
      ${dateFilter}
      GROUP BY category
      ORDER BY amount DESC
    `;

    const topMerchantsQuery = `
      SELECT 
        t.merchant_id,
        m.name,
        SUM(t.amount) as amount
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      ${dateFilter}
      GROUP BY t.merchant_id, m.name
      ORDER BY amount DESC
      LIMIT 5
    `;

    return new Promise((resolve, reject) => {
      conn.all(byCategoryQuery, (err: any, categoryRows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        conn.all(topMerchantsQuery, (err: any, merchantRows: any[]) => {
          if (err) {
            reject(err);
            return;
          }

          resolve({
            by_category: categoryRows.map(row => ({
              category: row.category,
              amount: Math.round(row.amount * 100) / 100
            })),
            top_merchants: merchantRows.map(row => ({
              merchant_id: row.merchant_id,
              name: row.name,
              amount: Math.round(row.amount * 100) / 100
            }))
          });
        });
      });
    });
  }

  async getMonthlySpendByCategory(): Promise<Array<{month: string, category: string, amount: number}>> {
    const conn = this.db.getConnection();
    
    const query = `
      SELECT 
        strftime('%Y-%m', ts) as month,
        category,
        SUM(amount) as amount
      FROM transactions 
      WHERE ts >= date('now', '-90 days')
      GROUP BY strftime('%Y-%m', ts), category
      ORDER BY month, category
    `;

    return new Promise((resolve, reject) => {
      conn.all(query, (err: any, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(rows.map(row => ({
          month: row.month,
          category: row.category,
          amount: Math.round(row.amount * 100) / 100
        })));
      });
    });
  }
}
