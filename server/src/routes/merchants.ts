import { Router } from 'express';
import { AggregatesService } from '../logic/aggregates';
import { DatabaseManager } from '../db';

const router = Router();

export function createMerchantsRouter(db: DatabaseManager) {
  const aggregatesService = new AggregatesService(db);

  // GET /merchants/nearby?lat=...&lng=...&radiusMeters=600
  router.get('/nearby', async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radiusMeters = parseInt(req.query.radiusMeters as string) || 600;

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: 'Invalid lat/lng parameters' });
      }

      const merchants = await aggregatesService.getMerchantsWithAggregates(lat, lng, radiusMeters);
      res.json(merchants);
    } catch (error) {
      console.error('Error fetching nearby merchants:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
