# MoneyLens Backend API

A comprehensive backend API for the MoneyLens financial tracking application, built with Node.js, TypeScript, Express, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based authentication with secure password hashing
- **Transaction Management**: Create, read, update, and delete financial transactions
- **Spending Caps**: Set and manage spending limits by merchant, category, or globally
- **Analytics & Reporting**: Comprehensive financial insights and dashboard data
- **Geographic Features**: Map-based spending visualization with heatmaps
- **Real-time Updates**: WebSocket support for live notifications and updates
- **Settings Management**: User preferences and configuration
- **Data Export**: Export transaction data in various formats

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **Real-time**: Socket.io
- **Validation**: Built-in TypeScript type checking
- **Environment**: dotenv for configuration

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/moneylens_db"
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_EXPIRES_IN="7d"
   PORT=3001
   NODE_ENV="development"
   CORS_ORIGIN="http://localhost:5173"
   ```

4. **Set up the database**:
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### Transactions
- `GET /api/transactions` - Get user transactions (with pagination/filtering)
- `POST /api/transactions` - Create new transaction
- `POST /api/transactions/simulate` - Simulate transaction
- `GET /api/transactions/:id` - Get specific transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/export/csv` - Export transactions as CSV

### Spending Caps
- `GET /api/caps` - Get user's spending caps
- `POST /api/caps` - Create new spending cap
- `PUT /api/caps/:id` - Update spending cap
- `PATCH /api/caps/:id/toggle` - Enable/disable cap
- `DELETE /api/caps/:id` - Delete spending cap

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard overview data
- `GET /api/analytics/spending-trends` - Get spending trend data
- `GET /api/analytics/category-breakdown` - Get category spending analysis
- `GET /api/analytics/merchant-analysis` - Get top merchants data
- `GET /api/analytics/insights` - Get AI-generated insights

### Map Features
- `GET /api/map/merchants` - Get merchants with coordinates
- `GET /api/map/heatmap-data` - Get spending heatmap data
- `GET /api/map/locations` - Get spending by location
- `POST /api/map/geocode` - Geocode address to coordinates
- `POST /api/map/reverse-geocode` - Reverse geocode coordinates to address

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings
- `GET /api/settings/notifications` - Get notification preferences
- `PUT /api/settings/notifications` - Update notification preferences
- `GET /api/settings/map` - Get map settings
- `PUT /api/settings/map` - Update map settings
- `GET /api/settings/export` - Export user data

## Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: User accounts and preferences
- **Transactions**: Financial transactions with location data
- **SpendingCaps**: Budget limits and spending rules
- **Merchants**: Merchant information and statistics
- **Notifications**: User notifications and alerts
- **Sessions**: User session management

## Real-time Features

The API supports WebSocket connections for real-time updates:

- **Transaction Updates**: Live transaction notifications
- **Spending Cap Alerts**: Real-time budget warnings
- **Budget Warnings**: Monthly budget notifications

## Security Features

- JWT-based authentication with configurable expiration
- Password hashing with bcryptjs
- CORS configuration for cross-origin requests
- Input validation and sanitization
- SQL injection prevention through Prisma ORM
- Rate limiting (can be added with express-rate-limit)

## Development

### Project Structure
```
src/
├── controllers/     # Route controllers
├── services/        # Business logic services
├── models/          # Data models
├── routes/          # API route definitions
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
├── scripts/         # Database scripts and seeds
└── index.ts         # Application entry point
```

### Adding New Features

1. Define types in `src/types/index.ts`
2. Create database models in `prisma/schema.prisma`
3. Add routes in `src/routes/`
4. Implement business logic in `src/services/`
5. Add middleware if needed in `src/middleware/`

## Production Deployment

1. Build the application: `npm run build`
2. Set production environment variables
3. Run database migrations: `npm run db:migrate`
4. Start the server: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
