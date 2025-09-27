import express from 'express';
import cors from 'cors';
import { dbManager } from './db';
import { createMerchantsRouter } from './routes/merchants';
import { createTransactionsRouter } from './routes/transactions';
import { createRulesRouter } from './routes/rules';
import { createCardRouter } from './routes/card';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database and seed data
async function initializeDatabase() {
  try {
    await dbManager.seedData();
    console.log('Database initialized and seeded');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// Routes
app.use('/merchants', createMerchantsRouter(dbManager));
app.use('/transactions', createTransactionsRouter(dbManager));
app.use('/rules', createRulesRouter(dbManager));
app.use('/card', createCardRouter(dbManager));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`MoneyLens server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

startServer().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  dbManager.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  dbManager.close();
  process.exit(0);
});
