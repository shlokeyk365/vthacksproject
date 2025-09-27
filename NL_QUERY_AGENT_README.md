# Natural Language Query Agent

## Overview

The Natural Language Query Agent is an intelligent system that allows users to ask questions about their financial data in plain English and automatically generates relevant visualizations. This agent understands user intent and creates appropriate charts, graphs, and analytics based on natural language queries.

## Features

### 🗣️ Natural Language Processing
- **Intent Recognition**: Automatically detects what type of analysis the user wants
- **Query Parsing**: Extracts key information like categories, merchants, time ranges, and metrics
- **Smart Suggestions**: Provides intelligent query suggestions based on user's spending patterns

### 📊 Automatic Visualization Generation
- **Chart Type Selection**: Automatically chooses the most appropriate chart type (line, bar, pie, area)
- **Data Aggregation**: Intelligently groups and aggregates data based on query intent
- **Dynamic Configuration**: Generates chart configurations optimized for the specific data

### 🎯 Supported Query Types

#### Trend Analysis
- "Show my dining spending trends"
- "Display my shopping expenses over time"
- "How has my transportation spending changed?"

#### Comparisons
- "Compare my spending by category"
- "Show me Amazon vs Target spending"
- "Which merchants do I spend the most at?"

#### Breakdowns
- "Break down my spending by category"
- "Show my spending distribution"
- "What percentage goes to dining?"

#### Metrics
- "How much did I spend this month?"
- "What's my total dining expenses?"
- "Show my average transaction amount"

## API Endpoints

### POST `/api/nl-query/query`
Process a natural language query and generate visualization.

**Request Body:**
```json
{
  "query": "Show my dining expenses for the last month"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "Show my dining expenses for the last month",
    "intent": {
      "type": "trend",
      "chartType": "line",
      "title": "Dining Spending Trend (Last Month)",
      "description": "Visualization showing dining spending trends over time"
    },
    "visualization": {
      "data": [...],
      "config": {...},
      "title": "Dining Spending Trend (Last Month)",
      "description": "Visualization showing dining spending trends over time",
      "chartType": "line"
    }
  },
  "message": "Generated line chart for: Dining Spending Trend (Last Month)"
}
```

### GET `/api/nl-query/suggestions`
Get intelligent query suggestions based on user's spending patterns.

**Response:**
```json
{
  "success": true,
  "data": [
    "Show my dining spending trends",
    "Compare my spending by category",
    "How much did I spend at Starbucks?",
    "Display my transportation costs over time"
  ],
  "message": "Query suggestions generated successfully"
}
```

### GET `/api/nl-query/history`
Get user's query history.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "query": "Show my dining expenses",
      "timestamp": "2024-01-15T10:30:00Z",
      "chartType": "line",
      "success": true
    }
  ],
  "message": "Query history retrieved successfully"
}
```

## Usage Examples

### Frontend Integration

```tsx
import { NLQueryInterface } from '@/components/analytics/NLQueryInterface';

function AnalyticsPage() {
  return (
    <div>
      <h1>Financial Analytics</h1>
      <NLQueryInterface />
      {/* Other analytics components */}
    </div>
  );
}
```

### Backend Usage

```typescript
import { NLQueryAgent } from './agents/NLQueryAgent';

const agent = new NLQueryAgent();

// Parse a query
const intent = await agent.parseQuery("Show my dining expenses", userId);

// Generate visualization
const result = await agent.generateVisualization(intent, userId);
```

## Query Patterns

### Time-based Queries
- "last month", "past week", "this year", "last 3 months"
- Automatically sets appropriate date ranges

### Category Queries
- "dining", "food", "restaurant", "coffee"
- "shopping", "transport", "gas", "utilities"
- Automatically filters by spending categories

### Merchant Queries
- "Amazon", "Starbucks", "Target", "Shell"
- Automatically filters by specific merchants

### Intent Detection
- **Trend**: "show", "display", "trend", "over time"
- **Comparison**: "compare", "vs", "versus", "against"
- **Breakdown**: "breakdown", "split", "distribution", "by category"
- **Metrics**: "how much", "total", "spent", "amount"

## Chart Types Generated

### Line Charts
- Time series data
- Trend analysis
- Spending over time

### Bar Charts
- Comparisons
- Category analysis
- Merchant comparisons

### Pie Charts
- Spending breakdowns
- Category distributions
- Percentage analysis

### Area Charts
- Cumulative spending
- Stacked categories
- Trend visualization

## Configuration

### Chart Colors
```typescript
const colors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316'  // Orange
];
```

### Time Range Mapping
```typescript
const timeRanges = {
  'last week': '7',
  'last month': '30',
  'last 3 months': '90',
  'last 6 months': '180',
  'last year': '365'
};
```

## Error Handling

The agent includes comprehensive error handling for:
- Invalid queries
- Missing data
- Database connection issues
- Chart generation failures

## Performance Considerations

- **Caching**: Query results are cached for improved performance
- **Pagination**: Large datasets are paginated automatically
- **Optimization**: Database queries are optimized for speed
- **Memory Management**: Efficient data processing and cleanup

## Future Enhancements

### Planned Features
- **Voice Queries**: Speech-to-text integration
- **Advanced Analytics**: Machine learning insights
- **Custom Dashboards**: User-defined layouts
- **Export Options**: PDF, PNG, CSV exports
- **Real-time Updates**: Live data synchronization

### AI Improvements
- **Better Intent Recognition**: Enhanced NLP models
- **Context Awareness**: Understanding of previous queries
- **Personalization**: Learning from user preferences
- **Predictive Suggestions**: Proactive insights

## Testing

Run the test suite to verify functionality:

```bash
# Backend tests
cd backend
npm test

# Test the NL Query Agent specifically
npx ts-node src/test/nl-query-test.ts
```

## Contributing

When adding new features to the Natural Language Query Agent:

1. **Update Intent Patterns**: Add new regex patterns in `parseQuery()`
2. **Add Chart Types**: Implement new visualization types
3. **Extend Filters**: Support additional data filtering options
4. **Improve Suggestions**: Enhance query suggestion algorithms
5. **Add Tests**: Include comprehensive test coverage

## Troubleshooting

### Common Issues

**Query not recognized:**
- Check if the query matches existing intent patterns
- Add new patterns for unrecognized query types
- Verify query normalization

**No data returned:**
- Check database connection
- Verify user authentication
- Ensure data exists for the specified filters

**Chart generation fails:**
- Validate data format
- Check chart configuration
- Verify Recharts component setup

### Debug Mode

Enable debug logging by setting:
```typescript
process.env.NL_QUERY_DEBUG = 'true'
```

This will log detailed information about query parsing and visualization generation.
