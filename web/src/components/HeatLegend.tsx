import React from 'react';
import { Merchant } from '../lib/api';

interface HeatLegendProps {
  merchants: Merchant[];
}

const HeatLegend: React.FC<HeatLegendProps> = ({ merchants }) => {
  const maxSpend = Math.max(...merchants.map(m => m.last30_spend), 1);
  
  const getColor = (value: number) => {
    const normalized = value / maxSpend;
    if (normalized < 0.2) return 'rgb(0, 255, 0)';
    if (normalized < 0.4) return 'rgb(255, 255, 0)';
    if (normalized < 0.6) return 'rgb(255, 165, 0)';
    if (normalized < 0.8) return 'rgb(255, 0, 0)';
    return 'rgb(128, 0, 128)';
  };

  const getLabel = (value: number) => {
    const normalized = value / maxSpend;
    if (normalized < 0.2) return 'Low';
    if (normalized < 0.4) return 'Medium';
    if (normalized < 0.6) return 'High';
    if (normalized < 0.8) return 'Very High';
    return 'Extreme';
  };

  const legendItems = [
    { value: 0, label: 'Low' },
    { value: 0.2, label: 'Medium' },
    { value: 0.4, label: 'High' },
    { value: 0.6, label: 'Very High' },
    { value: 0.8, label: 'Extreme' }
  ];

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <div className="heatmap-legend">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Spending Heatmap</h3>
        <p className="text-xs text-gray-600 mb-3">Last 30 days spend intensity</p>
        
        <div className="space-y-1">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getColor(item.value * maxSpend) }}
              />
              <span className="text-xs text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Max: ${maxSpend.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeatLegend;
