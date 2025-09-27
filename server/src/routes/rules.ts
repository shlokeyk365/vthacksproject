import { Router } from 'express';
import { RulesEngine } from '../logic/rulesEngine';
import { DatabaseManager } from '../db';
import { CreateRuleRequest } from '../types';

const router = Router();

export function createRulesRouter(db: DatabaseManager) {
  const rulesEngine = new RulesEngine(db);

  // GET /rules
  router.get('/', async (req, res) => {
    try {
      const rules = await rulesEngine.getRules();
      res.json(rules);
    } catch (error) {
      console.error('Error fetching rules:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /rules
  router.post('/', async (req, res) => {
    try {
      const ruleData: CreateRuleRequest = req.body;

      // Validate required fields
      if (!ruleData.type || !ruleData.cap_amount || ruleData.cap_amount <= 0) {
        return res.status(400).json({ error: 'Invalid rule data' });
      }

      // Validate type-specific fields
      if (ruleData.type === 'merchant_cap' && !ruleData.target_id) {
        return res.status(400).json({ error: 'target_id required for merchant_cap' });
      }

      if (ruleData.type === 'category_cap' && !ruleData.category) {
        return res.status(400).json({ error: 'category required for category_cap' });
      }

      const rule = await rulesEngine.createRule(ruleData);
      res.status(201).json(rule);
    } catch (error) {
      console.error('Error creating rule:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /rules/:id
  router.put('/:id', async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      const updates = req.body;

      if (isNaN(ruleId)) {
        return res.status(400).json({ error: 'Invalid rule ID' });
      }

      await rulesEngine.updateRule(ruleId, updates);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating rule:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /rules/:id
  router.delete('/:id', async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);

      if (isNaN(ruleId)) {
        return res.status(400).json({ error: 'Invalid rule ID' });
      }

      await rulesEngine.deleteRule(ruleId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting rule:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
