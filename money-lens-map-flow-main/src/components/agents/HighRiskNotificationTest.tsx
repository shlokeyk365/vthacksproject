import React from 'react';
import { Button } from '@/components/ui/button';
import { useFinancialBodyguard } from '@/contexts/FinancialBodyguardContext';
import { AlertTriangle } from 'lucide-react';

export const HighRiskNotificationTest: React.FC = () => {
  const { 
    showBlockingNotification,
    currentBlockingNotification
  } = useFinancialBodyguard();

  const testAppleStyleNotification = () => {
    showBlockingNotification({
      title: '⚠️ High Risk Location Detected!',
      message: 'You\'ve entered a high-risk spending zone! MoneyLens has detected unusual financial activity in this area. This location has been flagged for potential overspending risks.',
      severity: 'critical',
      onConfirm: () => {
        console.log('User confirmed to proceed with caution');
        // Add any additional logic here
      },
      onDismiss: () => {
        console.log('User dismissed the notification');
        // Add any additional logic here
      },
      confirmText: 'Proceed with Caution',
      dismissText: 'Turn Back',
      showDismiss: true
    });
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-yellow-500" />
        <h3 className="text-white font-semibold">Apple-Style High-Risk Notification Test</h3>
      </div>
      
      <div className="space-y-3">
        <Button
          onClick={testAppleStyleNotification}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          Test Apple-Style High Risk Notification
        </Button>
        
        {currentBlockingNotification && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-100 text-sm">
              Apple-style notification is currently active
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
