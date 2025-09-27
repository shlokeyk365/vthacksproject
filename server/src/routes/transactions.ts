import { Router } from 'express';
import { AggregatesService } from '../logic/aggregates';
import { RulesEngine } from '../logic/rulesEngine';
import { LocksService } from '../logic/locks';
import { DatabaseManager } from '../db';
import { SimulateTransactionRequest } from '../types';

const router = Router();

export function createTransactionsRouter(db: DatabaseManager) {
  const aggregatesService = new AggregatesService(db);
  const rulesEngine = new RulesEngine(db);
  const locksService = new LocksService(db);

  // GET /transactions/summary?window=30d
  router.get('/summary', async (req, res) => {
    try {
      const window = req.query.window as string || '30d';
      const summary = await aggregatesService.getTransactionSummary(window);
      res.json(summary);
    } catch (error) {
      console.error('Error fetching transaction summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /transactions/simulate
  router.post('/simulate', async (req, res) => {
    try {
      const { merchant_id, amount }: SimulateTransactionRequest = req.body;

      if (!merchant_id || !amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid merchant_id or amount' });
      }

      const conn = db.getConnection();
      
      // Check if override is enabled for this merchant
      const hasOverride = rulesEngine.getOverrideFlag(merchant_id);
      
      // Get current cap status
      const capStatus = await rulesEngine.checkCapStatus(merchant_id);
      
      // If over cap and no override, reject the transaction
      if (capStatus.overCap && !hasOverride) {
        return res.status(400).json({ 
          error: 'Transaction blocked: spending cap exceeded',
          capStatus 
        });
      }

      // Insert the transaction
      const txnId = Date.now();
      const now = new Date().toISOString();
      
      // Get merchant category
      const merchantQuery = 'SELECT category FROM merchants WHERE merchant_id = ?';
      const merchant = await new Promise((resolve, reject) => {
        conn.get(merchantQuery, [merchant_id], (err: any, row: any) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!merchant) {
        return res.status(404).json({ error: 'Merchant not found' });
      }

      const insertQuery = `
        INSERT INTO transactions (txn_id, merchant_id, amount, ts, category)
        VALUES (?, ?, ?, ?, ?)
      `;

      await new Promise((resolve, reject) => {
        conn.run(insertQuery, [txnId, merchant_id, amount, now, (merchant as any).category], (err: any) => {
          if (err) reject(err);
          else resolve(true);
        });
      });

      // Clear override flag if it was set
      if (hasOverride) {
        rulesEngine.clearOverrideFlag(merchant_id);
      }

      // Check if this transaction puts us over cap and lock if needed
      const newCapStatus = await rulesEngine.checkCapStatus(merchant_id);
      if (newCapStatus.overCap) {
        await locksService.setCardLock({
          merchant_id,
          locked: true
        });
      }

      // Get updated merchant aggregates
      const updatedMerchants = await aggregatesService.getMerchantsWithAggregates(37.2296, -80.4139, 1000);
      const updatedMerchant = updatedMerchants.find(m => m.merchant_id === merchant_id);

      res.json({
        success: true,
        transaction_id: txnId,
        merchant: updatedMerchant,
        capStatus: newCapStatus,
        overrode: hasOverride
      });
    } catch (error) {
      console.error('Error simulating transaction:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
