# Financial Bodyguard Agent 🛡️

## Overview

The Financial Bodyguard is an AI-powered spending protection system that monitors your location and spending patterns in real-time to help prevent overspending and make smarter financial decisions.

## Features

### 🎯 **Real-Time Risk Assessment**
- Analyzes transaction risk based on amount, merchant history, location, time, and frequency
- Provides instant feedback with risk scores (0-100) and recommendations
- Categorizes risk levels: Safe, Caution, Warning, Danger, Critical

### 📍 **Location-Aware Protection**
- Tracks your location using browser geolocation API
- Creates geofences around high-risk merchants
- Alerts when entering/exiting spending zones
- Integrates with existing map visualization

### 🧠 **Intelligent Pattern Recognition**
- Learns from your spending history
- Identifies high-risk merchants and spending patterns
- Adapts risk thresholds based on your behavior
- Tracks spending frequency and amounts

### ⚙️ **Customizable Settings**
- Set daily, weekly, and monthly spending limits
- Enable/disable location tracking
- Configure real-time alerts
- Adjust risk sensitivity levels

## How It Works

### 1. **Risk Assessment Engine**
The agent evaluates transactions using multiple factors:

- **Amount Risk**: Compares transaction amount to your spending limits
- **Merchant Risk**: Analyzes historical spending at the merchant
- **Location Risk**: Considers your current location and nearby merchants
- **Time Risk**: Factors in time of day and day of week
- **Frequency Risk**: Tracks how often you visit the same merchant

### 2. **Location Tracking**
- Uses browser geolocation API for real-time location updates
- Creates geofences around known merchants
- Monitors entry/exit from spending zones
- Provides location-based risk assessments

### 3. **Pattern Learning**
- Tracks spending patterns over time
- Identifies merchants with high spending risk
- Learns your typical spending behaviors
- Adapts recommendations based on your history

## Usage

### Activating the Agent
1. Navigate to the Financial Bodyguard page
2. Click "Activate" to start the agent
3. Grant location permissions when prompted
4. Configure your spending limits in settings

### Monitoring Transactions
- The agent automatically assesses all transactions
- Risk assessments appear in real-time
- Alerts are shown for high-risk transactions
- Dashboard shows current status and patterns

### Transaction Simulator
- Test the agent with simulated transactions
- Adjust simulation speed and parameters
- See real-time risk assessments
- Learn how the agent responds to different scenarios

## Technical Implementation

### Core Components

1. **FinancialBodyguard.ts** - Main agent class with risk assessment logic
2. **LocationTracker.ts** - Handles geolocation and geofencing
3. **FinancialBodyguardContext.tsx** - React context for state management
4. **FinancialBodyguardDashboard.tsx** - Main dashboard UI
5. **TransactionSimulator.tsx** - Testing and simulation interface

### Risk Scoring Algorithm

```typescript
// Risk factors are weighted and combined
const riskScore = 
  amountRisk.weight * severityWeight(amountRisk.severity) +
  merchantRisk.weight * severityWeight(merchantRisk.severity) +
  locationRisk.weight * severityWeight(locationRisk.severity) +
  timeRisk.weight * severityWeight(timeRisk.severity) +
  frequencyRisk.weight * severityWeight(frequencyRisk.severity);
```

### Severity Weights
- Critical: 4x weight
- High: 3x weight  
- Medium: 2x weight
- Low: 1x weight

## Demo Scenarios

### High-Risk Transaction
- **Amount**: $150 at Apple Store
- **Time**: Late night (11 PM)
- **Frequency**: 3rd visit this week
- **Result**: Critical risk, transaction blocked

### Safe Transaction
- **Amount**: $25 at Starbucks
- **Time**: Morning (9 AM)
- **Frequency**: First visit today
- **Result**: Safe, transaction allowed

### Location-Based Alert
- **Location**: Near Target store
- **History**: High spending at Target
- **Result**: Warning alert, suggest alternatives

## Privacy & Security

- All location data is processed locally
- No personal data is sent to external servers
- User preferences stored in localStorage
- Granular control over data sharing

## Future Enhancements

- Integration with real banking APIs
- Machine learning for better pattern recognition
- Voice alerts and notifications
- Integration with budgeting apps
- Social spending insights
- Predictive spending forecasts

## Getting Started

1. **Install Dependencies**: All required packages are already included
2. **Activate Agent**: Go to Financial Bodyguard page and click "Activate"
3. **Set Preferences**: Configure your spending limits and preferences
4. **Test with Simulator**: Use the transaction simulator to see how it works
5. **Monitor Dashboard**: Watch real-time risk assessments and patterns

The Financial Bodyguard is designed to be your personal AI assistant for smarter spending decisions, providing real-time protection and insights to help you stay on track with your financial goals.
