import React from 'react';
import { Button } from '@/components/ui/button';
import { useFinancialBodyguard } from '@/contexts/FinancialBodyguardContext';
import { AlertTriangle, Shield, Zap, Battery } from 'lucide-react';

export const SpendingAlertDemo: React.FC = () => {
  const { showBlockingNotification } = useFinancialBodyguard();

  const testCriticalNotification = () => {
    showBlockingNotification({
      title: '⚠️ Critical Risk Detected!',
      message: 'You\'ve entered a high-risk spending zone! MoneyLens has detected unusual financial activity in this area. This location has been flagged for potential overspending risks.',
      severity: 'critical',
      onConfirm: () => {
        console.log('User confirmed to proceed with caution');
      },
      onDismiss: () => {
        console.log('User dismissed the notification');
      },
      confirmText: 'Proceed with Caution',
      dismissText: 'Turn Back',
      showDismiss: true
    });
  };

  const testDangerNotification = () => {
    showBlockingNotification({
      title: '🚨 Danger Zone Alert!',
      message: 'You\'re approaching a high-risk spending area. Previous users have reported overspending in this location. Consider setting a spending limit before proceeding.',
      severity: 'danger',
      onConfirm: () => {
        console.log('User confirmed to proceed');
      },
      onDismiss: () => {
        console.log('User dismissed the notification');
      },
      confirmText: 'Set Spending Limit',
      dismissText: 'Avoid Area',
      showDismiss: true
    });
  };

  const testHighRiskNotification = () => {
    showBlockingNotification({
      title: '📍 High-Risk Location',
      message: 'You\'ve entered a high-risk spending zone. MoneyLens recommends setting a daily spending limit for this area to prevent overspending.',
      severity: 'high',
      onConfirm: () => {
        console.log('User confirmed to proceed');
      },
      onDismiss: () => {
        console.log('User dismissed the notification');
      },
      confirmText: 'Continue',
      dismissText: 'Go Back',
      showDismiss: true
    });
  };

  const testWarningNotification = () => {
    showBlockingNotification({
      title: '⚠️ Spending Alert',
      message: 'You\'re in a moderate-risk spending area. Consider setting a budget for this visit to avoid overspending.',
      severity: 'warning',
      onConfirm: () => {
        console.log('User confirmed to proceed');
      },
      onDismiss: () => {
        console.log('User dismissed the notification');
      },
      confirmText: 'Set Budget',
      dismissText: 'Continue',
      showDismiss: true
    });
  };

  const testNoDismissNotification = () => {
    showBlockingNotification({
      title: '🔒 Security Alert',
      message: 'Your account has been flagged for unusual activity. Please confirm your identity to continue using MoneyLens.',
      severity: 'critical',
      onConfirm: () => {
        console.log('User confirmed security check');
      },
      confirmText: 'Verify Identity',
      showDismiss: false
    });
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg border border-gray-700">
        <div className="flex items-center space-x-2 mb-6">
          <Battery className="w-6 h-6 text-blue-500" />
          <h3 className="text-white font-semibold text-lg">Spending Alert Demo</h3>
        </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={testCriticalNotification}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Critical Risk (Red)</span>
          </Button>
          
          <Button
            onClick={testDangerNotification}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Danger Zone (Orange)</span>
          </Button>
          
          <Button
            onClick={testHighRiskNotification}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white flex items-center space-x-2"
          >
            <Shield className="w-4 h-4" />
            <span>High Risk (Yellow)</span>
          </Button>
          
          <Button
            onClick={testWarningNotification}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <Shield className="w-4 h-4" />
            <span>Warning (Blue)</span>
          </Button>
        </div>
        
        <div className="pt-4 border-t border-gray-700">
          <Button
            onClick={testNoDismissNotification}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>No Dismiss Option (Critical)</span>
          </Button>
        </div>
        
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <p className="text-gray-300 text-sm">
            <strong>Features:</strong> These spending alerts block the entire app until the user takes action, 
            helping you make informed financial decisions. They prevent scrolling and require explicit user confirmation.
          </p>
        </div>
      </div>
    </div>
  );
};
