import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, Map, CreditCard, BarChart3, Download, Bell, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";
import { useFinancialBodyguard } from "@/contexts/FinancialBodyguardContext";

export function QuickActions() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { showBlockingNotification } = useFinancialBodyguard();

  const triggerDemoNotification = () => {
    addNotification({
      type: 'info',
      title: '🎉 Welcome to VT Hacks Demo!',
      message: 'You\'ve arrived at Owens Ballroom! This is where the MoneyLens demo is taking place. Check out the smart financial features!',
      category: 'system',
      actionUrl: '/bodyguard'
    });
  };

  const triggerHighRiskNotification = () => {
    showBlockingNotification({
      title: '⚠️ High Risk Location Detected!',
      message: 'You\'ve entered a high-risk spending zone! MoneyLens has detected unusual financial activity in this area. This location has been flagged for potential overspending risks.',
      severity: 'critical',
      onConfirm: () => {
        console.log('User confirmed to proceed with caution in high-risk area');
        addNotification({
          type: 'success',
          title: 'Proceeding with Enhanced Monitoring',
          message: 'MoneyLens will closely monitor your spending in this area.',
          category: 'system'
        });
      },
      onDismiss: () => {
        console.log('User chose to avoid the high-risk area');
        addNotification({
          type: 'info',
          title: 'Smart Choice!',
          message: 'Avoiding high-risk spending area.',
          category: 'system'
        });
      },
      confirmText: 'Proceed with Caution',
      dismissText: 'Turn Back',
      showDismiss: true
    });
  };

  const triggerSpendingAlert = () => {
    showBlockingNotification({
      title: '💰 Spending Alert Demo',
      message: 'This is a demonstration of the blocking spending alert system. It prevents app interaction until you take action, helping you make informed financial decisions.',
      severity: 'warning',
      onConfirm: () => {
        console.log('User confirmed spending alert');
        addNotification({
          type: 'success',
          title: 'Spending Alert Confirmed',
          message: 'You\'ve successfully interacted with the spending alert system.',
          category: 'system'
        });
      },
      onDismiss: () => {
        console.log('User dismissed spending alert');
        addNotification({
          type: 'info',
          title: 'Spending Alert Dismissed',
          message: 'You\'ve dismissed the spending alert.',
          category: 'system'
        });
      },
      confirmText: 'Continue',
      dismissText: 'Cancel',
      showDismiss: true
    });
  };

  const actions = [
    {
      label: "Add Spending Cap",
      icon: Target,
      variant: "default" as const,
      onClick: () => navigate("/caps"),
    },
    {
      label: "View Map",
      icon: Map,
      variant: "outline" as const,
      onClick: () => navigate("/map"),
    },
    {
      label: "Simulate Transaction",
      icon: CreditCard,
      variant: "outline" as const,
      onClick: () => navigate("/transactions"),
    },
    {
      label: "View Analytics",
      icon: BarChart3,
      variant: "outline" as const,
      onClick: () => navigate("/analytics"),
    },
    {
      label: "Demo Notification",
      icon: Bell,
      variant: "outline" as const,
      onClick: triggerDemoNotification,
    },
    {
      label: "Test High Risk",
      icon: AlertTriangle,
      variant: "destructive" as const,
      onClick: triggerHighRiskNotification,
    },
    {
      label: "Spending Alert",
      icon: Bell,
      variant: "outline" as const,
      onClick: triggerSpendingAlert,
    },
  ];

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.label}
                variant={action.variant}
                className="h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-center min-h-[80px] sm:min-h-[90px]"
                onClick={action.onClick}
              >
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-xs font-medium leading-tight">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}