import { Router } from 'express';
import { LocksService } from '../logic/locks';
import { RulesEngine } from '../logic/rulesEngine';
import { DatabaseManager } from '../db';
import { CardLockRequest } from '../types';

const router = Router();

export function createCardRouter(db: DatabaseManager) {
  const locksService = new LocksService(db);
  const rulesEngine = new RulesEngine(db);

  // POST /card/lock
  router.post('/lock', async (req, res) => {
    try {
      const { merchant_id, locked }: CardLockRequest = req.body;

      if (!merchant_id || typeof locked !== 'boolean') {
        return res.status(400).json({ error: 'Invalid lock data' });
      }

      const lock = await locksService.setCardLock({ merchant_id, locked });
      res.json(lock);
    } catch (error) {
      console.error('Error setting card lock:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /card/locks
  router.get('/locks', async (req, res) => {
    try {
      const locks = await locksService.getAllLocks();
      res.json(locks);
    } catch (error) {
      console.error('Error fetching card locks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /card/override
  router.post('/override', async (req, res) => {
    try {
      const { merchant_id } = req.body;

      if (!merchant_id) {
        return res.status(400).json({ error: 'merchant_id required' });
      }

      // Set override flag for one transaction
      rulesEngine.setOverrideFlag(merchant_id, true);
      
      res.json({ 
        success: true, 
        message: 'Override enabled for next transaction',
        merchant_id 
      });
    } catch (error) {
      console.error('Error setting override:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
