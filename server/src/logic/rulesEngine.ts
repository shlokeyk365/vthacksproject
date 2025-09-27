import { DatabaseManager } from '../db';
import { Rule, CreateRuleRequest } from '../types';

export class RulesEngine {
  private overrideFlags: Map<number, boolean> = new Map();

  constructor(private db: DatabaseManager) {}

  async createRule(ruleData: CreateRuleRequest): Promise<Rule> {
    const conn = this.db.getConnection();
    const ruleId = Date.now(); // Simple ID generation

    const query = `
      INSERT INTO rules (rule_id, type, target_id, category, cap_amount, window, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      conn.run(query, [
        ruleId,
        ruleData.type,
        ruleData.target_id || null,
        ruleData.category || null,
        ruleData.cap_amount,
        ruleData.window,
        ruleData.active
      ], function(err: any) {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          rule_id: ruleId,
          type: ruleData.type,
          target_id: ruleData.target_id,
          category: ruleData.category,
          cap_amount: ruleData.cap_amount,
          window: ruleData.window,
          active: ruleData.active
        });
      });
    });
  }

  async getRules(): Promise<Rule[]> {
    const conn = this.db.getConnection();
    const query = 'SELECT * FROM rules WHERE active = true ORDER BY rule_id';

    return new Promise((resolve, reject) => {
      conn.all(query, (err: any, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(rows.map(row => ({
          rule_id: row.rule_id,
          type: row.type,
          target_id: row.target_id,
          category: row.category,
          cap_amount: row.cap_amount,
          window: row.window,
          active: row.active
        })));
      });
    });
  }

  async updateRule(ruleId: number, ruleData: Partial<CreateRuleRequest>): Promise<void> {
    const conn = this.db.getConnection();
    const updates = [];
    const values = [];

    if (ruleData.cap_amount !== undefined) {
      updates.push('cap_amount = ?');
      values.push(ruleData.cap_amount);
    }
    if (ruleData.active !== undefined) {
      updates.push('active = ?');
      values.push(ruleData.active);
    }

    if (updates.length === 0) {
      return;
    }

    values.push(ruleId);
    const query = `UPDATE rules SET ${updates.join(', ')} WHERE rule_id = ?`;

    return new Promise((resolve, reject) => {
      conn.run(query, values, (err: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async deleteRule(ruleId: number): Promise<void> {
    const conn = this.db.getConnection();
    const query = 'DELETE FROM rules WHERE rule_id = ?';

    return new Promise((resolve, reject) => {
      conn.run(query, [ruleId], (err: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async checkCapStatus(merchantId: number): Promise<{
    nearCap: boolean;
    overCap: boolean;
    capType: 'merchant' | 'category' | 'none';
    capAmount: number;
    currentSpend: number;
    percentage: number;
  }> {
    const conn = this.db.getConnection();
    
    // Get merchant info and current month spend
    const merchantQuery = `
      SELECT 
        m.merchant_id,
        m.category,
        COALESCE(mtd.mtd_spend, 0) as mtd_spend,
        merchant_cap.cap_amount as merchant_cap,
        category_cap.cap_amount as category_cap
      FROM merchants m
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
      WHERE m.merchant_id = ?
    `;

    return new Promise((resolve, reject) => {
      conn.get(merchantQuery, [merchantId], (err: any, row: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve({
            nearCap: false,
            overCap: false,
            capType: 'none',
            capAmount: 0,
            currentSpend: 0,
            percentage: 0
          });
          return;
        }

        const merchantCap = row.merchant_cap || 0;
        const categoryCap = row.category_cap || 0;
        const currentSpend = row.mtd_spend;
        
        let capAmount = 0;
        let capType: 'merchant' | 'category' | 'none' = 'none';
        
        if (merchantCap > 0) {
          capAmount = merchantCap;
          capType = 'merchant';
        } else if (categoryCap > 0) {
          capAmount = categoryCap;
          capType = 'category';
        }

        const percentage = capAmount > 0 ? (currentSpend / capAmount) * 100 : 0;
        const nearCap = percentage >= 80 && percentage < 100;
        const overCap = percentage >= 100;

        resolve({
          nearCap,
          overCap,
          capType,
          capAmount,
          currentSpend,
          percentage: Math.round(percentage * 100) / 100
        });
      });
    });
  }

  setOverrideFlag(merchantId: number, enabled: boolean): void {
    this.overrideFlags.set(merchantId, enabled);
  }

  getOverrideFlag(merchantId: number): boolean {
    return this.overrideFlags.get(merchantId) || false;
  }

  clearOverrideFlag(merchantId: number): void {
    this.overrideFlags.delete(merchantId);
  }
}
