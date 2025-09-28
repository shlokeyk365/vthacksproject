import React from 'react';
import { Button } from '@/components/ui/button';
import { useFinancialBodyguard } from '@/contexts/FinancialBodyguardContext';
import { AlertTriangle } from 'lucide-react';

export const HighRiskNotificationTest: React.FC = () => {
  const { 
    highRiskNotification, 
    dismissHighRiskNotification, 
    enableProtectionFromNotification,
    testHighRiskNotification
  } = useFinancialBodyguard();

  const testNotification = () => {
    // Trigger the notification for Owen's Ballroom
    testHighRiskNotification('Owen\'s Ballroom');
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-yellow-500" />
        <h3 className="text-white font-semibold">High-Risk Notification Test</h3>
      </div>
      
      <div className="space-y-3">
        <Button
          onClick={testNotification}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          Test Owen's Ballroom Notification
        </Button>
        
        {highRiskNotification.isVisible && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-100 text-sm">
              Notification is currently visible for: {highRiskNotification.areaName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
