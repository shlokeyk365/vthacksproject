# MoneyLens Backend Code

This file contains the complete backend code for the MoneyLens application.

## Main Server File (src/index.ts)

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import capRoutes from './routes/caps';
import analyticsRoutes from './routes/analytics';
import mapRoutes from './routes/map';
import settingsRoutes from './routes/settings';
import dataRoutes from './routes/data';
import leaderboardRoutes from './routes/leaderboard';
import plaidRoutes from './routes/plaid';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:8080",
      "http://localhost:8081",
      "http://localhost:8082", 
      "http://172.16.24.70:8080",
      "http://172.16.24.70:8081",
      "http://172.16.24.70:8082",
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // Allow any local network IP
      /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,  // Allow any local network IP
      /^https:\/\/.*\.ngrok-free\.dev$/,   // Allow ngrok domains
      /^https:\/\/.*\.ngrok\.io$/,         // Allow ngrok domains
    ],
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:8080",
    "http://localhost:8081",
    "http://localhost:8082", 
    "http://172.16.24.70:8080",
    "http://172.16.24.70:8081",
    "http://172.16.24.70:8082",
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // Allow any local network IP
    /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,  // Allow any local network IP
    /^https:\/\/.*\.ngrok-free\.dev$/,   // Allow ngrok domains
    /^https:\/\/.*\.ngrok\.io$/,         // Allow ngrok domains
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/caps', capRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/plaid', plaidRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join user to their personal room for real-time updates
  socket.on('join-user-room', (userId: string) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Handle spending cap alerts
  socket.on('subscribe-cap-alerts', (userId: string) => {
    socket.join(`cap-alerts-${userId}`);
  });

  // Handle transaction updates
  socket.on('subscribe-transactions', (userId: string) => {
    socket.join(`transactions-${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 MoneyLens Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export { io };
```

## Authentication Routes (src/routes/auth.ts)

```typescript
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, AuthenticatedRequest } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, monthlyBudgetGoal } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      throw new AppError('Please provide all required fields', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        monthlyBudgetGoal: monthlyBudgetGoal || 3500
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        monthlyBudgetGoal: true,
        preferences: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = (jwt.sign as any)(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-moneylens-2024',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const response: ApiResponse = {
      success: true,
      data: {
        user,
        token
      },
      message: 'User registered successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = (jwt.sign as any)(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-moneylens-2024',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response: ApiResponse = {
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const response: ApiResponse = {
      success: true,
      data: req.user,
      message: 'Profile retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { firstName, lastName, email, monthlyBudgetGoal, preferences } = req.body;
    const userId = req.user!.id;

    // Check if email is being changed and if it already exists
    if (email && email !== req.user!.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new AppError('Email already exists', 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(monthlyBudgetGoal !== undefined && { monthlyBudgetGoal }),
        ...(preferences && { preferences })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        monthlyBudgetGoal: true,
        preferences: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/change-password', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!currentPassword || !newPassword) {
      throw new AppError('Please provide current and new password', 400);
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Logout (client-side token removal)
router.post('/logout', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const response: ApiResponse = {
      success: true,
      message: 'Logout successful'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
```

## Transaction Routes (src/routes/transactions.ts)

```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, AuthenticatedRequest, CreateTransactionRequest, UpdateTransactionRequest, TransactionFilters, PaginationParams } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Get all transactions for user
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const {
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc',
      category,
      merchant,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      status
    } = req.query as TransactionFilters & PaginationParams;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {
      userId
    };

    if (category) where.category = category;
    if (merchant) where.merchant = { contains: merchant, mode: 'insensitive' };
    if (minAmount) where.amount = { ...where.amount, gte: Number(minAmount) };
    if (maxAmount) where.amount = { ...where.amount, lte: Number(maxAmount) };
    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    // Get transactions
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          merchant: true,
          amount: true,
          category: true,
          description: true,
          location: true,
          latitude: true,
          longitude: true,
          date: true,
          status: true,
          isSimulated: true,
          createdAt: true
        }
      }),
      prisma.transaction.count({ where })
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    const response: ApiResponse = {
      success: true,
      data: {
        transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      },
      message: 'Transactions retrieved successfully'
    };

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
});

// Create new transaction
router.post('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const transactionData: CreateTransactionRequest = req.body;

    // Validate required fields
    if (!transactionData.merchant || !transactionData.amount || !transactionData.category) {
      throw new AppError('Please provide merchant, amount, and category', 400);
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        merchant: transactionData.merchant,
        amount: transactionData.amount,
        category: transactionData.category,
        description: transactionData.description,
        location: transactionData.location,
        latitude: transactionData.latitude,
        longitude: transactionData.longitude,
        isSimulated: transactionData.isSimulated || false
      }
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user-${userId}`).emit('transaction-update', transaction);

    const response: ApiResponse = {
      success: true,
      data: transaction,
      message: 'Transaction created successfully'
    };

    return res.status(201).json(response);
  } catch (error) {
    return next(error);
  }
});

// Simulate transaction
router.post('/simulate', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const transactionData: CreateTransactionRequest = req.body;

    // Validate required fields
    if (!transactionData.merchant || !transactionData.amount || !transactionData.category) {
      throw new AppError('Please provide merchant, amount, and category', 400);
    }

    // Get user's budget and preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyBudgetGoal: true, preferences: true }
    });

    // Get all enabled spending caps
    const caps = await prisma.spendingCap.findMany({
      where: {
        userId,
        enabled: true
      }
    });

    const now = new Date();
    const violations = [];
    const warnings = [];
    let totalCurrentSpending = 0;

    // Check monthly budget first
    if (user?.monthlyBudgetGoal) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlySpending = await prisma.transaction.aggregate({
        where: {
          userId,
          date: { gte: startOfMonth },
          isSimulated: false // Don't include simulated transactions
        },
        _sum: { amount: true }
      });

      const currentMonthlySpent = Number(monthlySpending._sum.amount || 0);
      const wouldSpendMonthly = currentMonthlySpent + Number(transactionData.amount);
      const monthlyBudget = user.monthlyBudgetGoal;

      if (wouldSpendMonthly > monthlyBudget) {
        violations.push({
          type: 'MONTHLY_BUDGET',
          name: 'Monthly Budget',
          limit: monthlyBudget,
          current: currentMonthlySpent,
          wouldExceed: wouldSpendMonthly - monthlyBudget,
          percentage: (wouldSpendMonthly / monthlyBudget) * 100
        });
      } else if (wouldSpendMonthly > monthlyBudget * 0.9) {
        warnings.push({
          type: 'MONTHLY_BUDGET_WARNING',
          name: 'Monthly Budget Warning',
          limit: monthlyBudget,
          current: currentMonthlySpent,
          wouldSpend: wouldSpendMonthly,
          percentage: (wouldSpendMonthly / monthlyBudget) * 100
        });
      }
    }

    // Check each spending cap - only show violations for caps that directly apply to this transaction
    for (const cap of caps) {
      let periodStart: Date;
      
      switch (cap.period) {
        case 'DAILY':
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'WEEKLY':
          const dayOfWeek = now.getDay();
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
          break;
        case 'MONTHLY':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'YEARLY':
          periodStart = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          continue;
      }

      // Check if this cap applies to the transaction
      let appliesToTransaction = false;
      if (cap.type === 'GLOBAL') {
        appliesToTransaction = true;
      } else if (cap.type === 'CATEGORY' && cap.category === transactionData.category) {
        appliesToTransaction = true;
      } else if (cap.type === 'MERCHANT' && cap.merchant === transactionData.merchant) {
        appliesToTransaction = true;
      }

      // Only check caps that directly apply to this transaction
      if (appliesToTransaction) {
        // Build where clause for this cap
        const whereClause: any = {
          userId,
          date: { gte: periodStart },
          isSimulated: false
        };

        if (cap.type === 'CATEGORY' && cap.category) {
          whereClause.category = cap.category;
        } else if (cap.type === 'MERCHANT' && cap.merchant) {
          whereClause.merchant = cap.merchant;
        }

        const currentSpending = await prisma.transaction.aggregate({
          where: whereClause,
          _sum: { amount: true }
        });

        const currentSpent = Number(currentSpending._sum.amount || 0);
        const wouldSpend = currentSpent + Number(transactionData.amount);

        if (wouldSpend > cap.limit) {
          violations.push({
            type: 'SPENDING_CAP',
            name: cap.name,
            capType: cap.type,
            period: cap.period,
            limit: cap.limit,
            current: currentSpent,
            wouldExceed: wouldSpend - cap.limit,
            percentage: (wouldSpend / cap.limit) * 100
          });
        } else if (wouldSpend > cap.limit * 0.8) {
          warnings.push({
            type: 'SPENDING_CAP_WARNING',
            name: cap.name,
            capType: cap.type,
            period: cap.period,
            limit: cap.limit,
            current: currentSpent,
            wouldSpend: wouldSpend,
            percentage: (wouldSpend / cap.limit) * 100
          });
        }
      }
    }

    // Calculate total current spending for context
    const totalSpending = await prisma.transaction.aggregate({
      where: {
        userId,
        isSimulated: false
      },
      _sum: { amount: true }
    });

    totalCurrentSpending = Number(totalSpending._sum.amount || 0);

    const response: ApiResponse = {
      success: true,
      data: {
        wouldBeApproved: violations.length === 0,
        transaction: {
          merchant: transactionData.merchant,
          amount: transactionData.amount,
          category: transactionData.category
        },
        violations,
        warnings,
        currentSpending: totalCurrentSpending,
        wouldSpend: totalCurrentSpending + Number(transactionData.amount),
        monthlyBudget: user?.monthlyBudgetGoal || null,
        spendingCaps: caps.length
      },
      message: violations.length === 0 
        ? (warnings.length > 0 
          ? 'Transaction would be approved with warnings' 
          : 'Transaction would be approved')
        : 'Transaction would be rejected due to budget/cap violations'
    };

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
});

// Update transaction
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const updateData: UpdateTransactionRequest = req.body;

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!existingTransaction) {
      throw new AppError('Transaction not found', 404);
    }

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user-${userId}`).emit('transaction-update', transaction);

    const response: ApiResponse = {
      success: true,
      data: transaction,
      message: 'Transaction updated successfully'
    };

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
});

// Delete transaction
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!existingTransaction) {
      throw new AppError('Transaction not found', 404);
    }

    // Delete transaction
    await prisma.transaction.delete({
      where: { id }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Transaction deleted successfully'
    };

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
});

export default router;
```

## Package.json

```json
{
  "name": "moneylens-backend",
  "version": "1.0.0",
  "description": "MoneyLens Backend API",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "seed": "ts-node src/scripts/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.7.1",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^17.2.2",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "prisma": "^5.7.1",
    "qrcode": "^1.5.3",
    "socket.io": "^4.7.4",
    "speakeasy": "^2.0.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.10.5",
    "@types/qrcode": "^1.5.5",
    "@types/speakeasy": "^2.0.10",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

## Environment Variables (.env)

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here-moneylens-2024"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# CORS
ALLOWED_ORIGINS="http://localhost:8080,http://localhost:8081,http://localhost:8082"
```

## Prisma Schema (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  password          String
  firstName         String
  lastName          String
  monthlyBudgetGoal Float     @default(3500)
  preferences       Json?
  twoFactorSecret   String?
  twoFactorEnabled  Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  transactions      Transaction[]
  spendingCaps      SpendingCap[]
  notifications     Notification[]

  @@map("users")
}

model Transaction {
  id          String    @id @default(cuid())
  userId      String
  merchant    String
  amount      Float
  category    String
  description String?
  location    String?
  latitude    Float?
  longitude   Float?
  date        DateTime  @default(now())
  status      String    @default("COMPLETED")
  isSimulated Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("transactions")
}

model SpendingCap {
  id        String   @id @default(cuid())
  userId    String
  type      String   // GLOBAL, CATEGORY, MERCHANT
  name      String
  limit     Float
  period    String   // DAILY, WEEKLY, MONTHLY, YEARLY
  enabled   Boolean  @default(true)
  category  String?
  merchant  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("spending_caps")
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String
  title     String
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}
```

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up database:**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `POST /api/transactions/simulate` - Simulate transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/search` - Search transactions

### Health Check
- `GET /health` - Server health check

## Features

- **User Authentication** with JWT tokens
- **Transaction Management** with CRUD operations
- **Spending Cap Simulation** with budget checking
- **Real-time Updates** via WebSocket
- **Advanced Search** with filters
- **Data Export** to CSV
- **Security** with bcrypt password hashing
- **CORS** configured for frontend access
- **Error Handling** with custom error classes
- **Logging** with Morgan
- **Security Headers** with Helmet

This backend provides a complete API for the MoneyLens financial management application with all the essential features for transaction tracking, spending caps, and user management.
