import React, { useState, useEffect } from 'react';
import { Vega } from 'react-vega';
import { TransactionSummary, Merchant } from '../lib/api';
import { apiClient } from '../lib/api';
import { Download } from 'lucide-react';

interface ChartsProps {
  transactionSummary: TransactionSummary | null;
  merchants: Merchant[];
}

interface MonthlySpendData {
  month: string;
  category: string;
  amount: number;
}

const Charts: React.FC<ChartsProps> = ({ transactionSummary, merchants }) => {
  const [monthlyData, setMonthlyData] = useState<MonthlySpendData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMonthlyData();
  }, []);

  const loadMonthlyData = async () => {
    try {
      setLoading(true);
      // This would be a new API endpoint for monthly data
      // For now, we'll generate some mock data based on the summary
      const mockData: MonthlySpendData[] = [];
      const months = ['2024-10', '2024-11', '2024-12'];
      const categories = transactionSummary?.by_category.map(c => c.category) || ['Dining', 'Bars', 'Groceries'];
      
      months.forEach(month => {
        categories.forEach(category => {
          mockData.push({
            month,
            category,
            amount: Math.random() * 200 + 50
          });
        });
      });
      
      setMonthlyData(mockData);
    } catch (error) {
      console.error('Failed to load monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart 1: Monthly Spend by Category (Stacked Area)
  const monthlySpendSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 300,
    height: 200,
    data: { values: monthlyData },
    mark: {
      type: 'area',
      line: { interpolate: 'monotone' },
      point: true
    },
    encoding: {
      x: {
        field: 'month',
        type: 'temporal',
        timeUnit: 'yearmonth',
        title: 'Month'
      },
      y: {
        field: 'amount',
        type: 'quantitative',
        title: 'Amount ($)',
        stack: 'zero'
      },
      color: {
        field: 'category',
        type: 'nominal',
        title: 'Category',
        scale: {
          range: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16']
        }
      },
      tooltip: [
        { field: 'month', type: 'temporal', title: 'Month' },
        { field: 'category', type: 'nominal', title: 'Category' },
        { field: 'amount', type: 'quantitative', title: 'Amount ($)', format: '.2f' }
      ]
    },
    config: {
      view: { stroke: 'transparent' }
    }
  };

  // Chart 2: Top 5 Merchants (Horizontal Bar)
  const topMerchantsData = transactionSummary?.top_merchants.slice(0, 5) || [];
  const topMerchantsSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 300,
    height: 200,
    data: { values: topMerchantsData },
    mark: 'bar',
    encoding: {
      y: {
        field: 'name',
        type: 'nominal',
        title: 'Merchant',
        sort: '-x'
      },
      x: {
        field: 'amount',
        type: 'quantitative',
        title: 'Amount ($)'
      },
      color: {
        value: '#3b82f6'
      },
      tooltip: [
        { field: 'name', type: 'nominal', title: 'Merchant' },
        { field: 'amount', type: 'quantitative', title: 'Amount ($)', format: '.2f' }
      ]
    },
    config: {
      view: { stroke: 'transparent' }
    }
  };

  const downloadChart = (chartId: string) => {
    // This would implement chart download functionality
    console.log(`Downloading chart: ${chartId}`);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading charts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Spending Analytics</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Monthly Spend Chart */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Monthly Spend by Category</h3>
            <button
              onClick={() => downloadChart('monthly')}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Download chart"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="h-48">
            <Vega spec={monthlySpendSpec} />
          </div>
        </div>

        {/* Top Merchants Chart */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Top 5 Merchants (Last 30 Days)</h3>
            <button
              onClick={() => downloadChart('merchants')}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Download chart"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="h-48">
            <Vega spec={topMerchantsSpec} />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Merchants:</span>
              <span className="font-medium">{merchants.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Locked Cards:</span>
              <span className="font-medium text-red-600">
                {merchants.filter(m => m.locked).length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Over Cap:</span>
              <span className="font-medium text-orange-600">
                {merchants.filter(m => m.over_cap).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
