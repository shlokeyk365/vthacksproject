import React from 'react';
import { useFinancialBodyguard } from '@/contexts/FinancialBodyguardContext';
import { AppleStyleNotification } from '@/components/ui/AppleStyleNotification';

export const AppleStyleNotificationManager: React.FC = () => {
  const { 
    currentBlockingNotification, 
    dismissBlockingNotification 
  } = useFinancialBodyguard();

  if (!currentBlockingNotification) {
    return null;
  }

  const handleConfirm = () => {
    currentBlockingNotification.onConfirm();
    dismissBlockingNotification(currentBlockingNotification.id);
  };

  const handleDismiss = () => {
    if (currentBlockingNotification.onDismiss) {
      currentBlockingNotification.onDismiss();
    }
    dismissBlockingNotification(currentBlockingNotification.id);
  };

  return (
    <AppleStyleNotification
      isVisible={currentBlockingNotification.isVisible}
      title={currentBlockingNotification.title}
      message={currentBlockingNotification.message}
      severity={currentBlockingNotification.severity}
      onConfirm={handleConfirm}
      onDismiss={currentBlockingNotification.showDismiss ? handleDismiss : undefined}
      confirmText={currentBlockingNotification.confirmText}
      dismissText={currentBlockingNotification.dismissText}
      showDismiss={currentBlockingNotification.showDismiss}
    />
  );
};
