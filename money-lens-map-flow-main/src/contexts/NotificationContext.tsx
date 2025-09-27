import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'spending' | 'budget' | 'security' | 'system';
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  checkSpendingAlerts: (spending: number, caps: any[]) => void;
  checkBudgetAlerts: (budget: any) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast notification
    const toastType = notification.type === 'error' ? 'error' : 
                     notification.type === 'warning' ? 'warning' : 
                     notification.type === 'success' ? 'success' : 'info';
    
    toast[toastType](notification.title, {
      description: notification.message,
      duration: 5000,
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Check for spending alerts
  const checkSpendingAlerts = useCallback((spending: number, caps: any[]) => {
    caps.forEach(cap => {
      const spentPercentage = (spending / cap.amount) * 100;
      
      if (spentPercentage >= 100) {
        addNotification({
          type: 'error',
          title: 'Budget Exceeded!',
          message: `You've exceeded your ${cap.category} budget of $${cap.amount}. Current spending: $${spending.toFixed(2)}`,
          category: 'spending',
          actionUrl: '/caps'
        });
      } else if (spentPercentage >= 90) {
        addNotification({
          type: 'warning',
          title: 'Budget Warning',
          message: `You're at ${spentPercentage.toFixed(1)}% of your ${cap.category} budget. Only $${(cap.amount - spending).toFixed(2)} remaining.`,
          category: 'spending',
          actionUrl: '/caps'
        });
      } else if (spentPercentage >= 75) {
        addNotification({
          type: 'info',
          title: 'Budget Update',
          message: `You've used ${spentPercentage.toFixed(1)}% of your ${cap.category} budget. $${(cap.amount - spending).toFixed(2)} remaining.`,
          category: 'spending',
          actionUrl: '/caps'
        });
      }
    });
  }, [addNotification]);

  // Check for budget alerts
  const checkBudgetAlerts = useCallback((budget: any) => {
    if (budget.monthlySpending > budget.monthlyBudget) {
      addNotification({
        type: 'error',
        title: 'Monthly Budget Exceeded',
        message: `You've exceeded your monthly budget by $${(budget.monthlySpending - budget.monthlyBudget).toFixed(2)}`,
        category: 'budget',
        actionUrl: '/analytics'
      });
    } else if (budget.monthlySpending > budget.monthlyBudget * 0.9) {
      addNotification({
        type: 'warning',
        title: 'Monthly Budget Warning',
        message: `You're at ${((budget.monthlySpending / budget.monthlyBudget) * 100).toFixed(1)}% of your monthly budget`,
        category: 'budget',
        actionUrl: '/analytics'
      });
    }
  }, [addNotification]);

  // Simulate some initial notifications for demo
  useEffect(() => {
    // Add some demo notifications
    setTimeout(() => {
      addNotification({
        type: 'info',
        title: 'Welcome to MoneyLens!',
        message: 'Your financial tracking dashboard is ready. Start by setting up your spending caps.',
        category: 'system',
        actionUrl: '/caps'
      });
    }, 2000);

    setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'Transaction Processed',
        message: 'Your recent transaction at Starbucks has been recorded successfully.',
        category: 'spending',
        actionUrl: '/transactions'
      });
    }, 5000);
  }, [addNotification]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    checkSpendingAlerts,
    checkBudgetAlerts,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
