# MoneyLens

A minimal, polished MVP for financial tracking with map overlays, spending caps, and geofence alerts.

## Features

- **Map + Heatmap**: Visualize spending patterns with Mapbox GL JS
- **Spending Caps**: Set monthly limits per merchant or category
- **Geofence Alerts**: Simulated location-based spending notifications
- **Card Lock**: Automatic card locking when caps are exceeded
- **Fixed Charts**: Monthly spend by category and top merchants
- **Transaction Simulation**: Test spending scenarios

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Charts**: Vega-Lite via react-vega
- **Map**: Mapbox GL JS (with graceful fallback)
- **Backend**: Node.js + Express + TypeScript
- **Database**: DuckDB (file-based)

## Quick Start

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your Mapbox token (optional)
   ```

3. Start development servers:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Project Structure

```
moneylens/
├── server/          # Backend API
├── web/            # Frontend React app
├── package.json    # Monorepo configuration
└── README.md
```

## API Endpoints

- `GET /merchants/nearby` - Get merchants within radius
- `GET /transactions/summary` - Get spending summaries
- `POST /transactions/simulate` - Simulate a transaction
- `GET /rules` - List spending caps
- `POST /rules` - Create/update spending caps
- `POST /card/lock` - Lock/unlock card for merchant

## Development

The app runs in development mode with hot reloading for both frontend and backend. The backend serves the API on port 3001, and the frontend runs on port 5173.
