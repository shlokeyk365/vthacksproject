import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export function SmartAlerts() {
  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'High Dining Spending',
      message: "You've spent 150% more on dining this month",
      icon: AlertTriangle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-500/30'
    },
    {
      id: 2,
      type: 'success',
      title: 'Transportation Under Budget',
      message: "You're $85 under your transportation budget",
      icon: TrendingDown,
      color: 'text-green-500',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/30'
    }
  ];

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Smart Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const IconComponent = alert.icon;
          return (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${alert.bgColor} ${alert.borderColor}`}
            >
              <div className="flex items-start gap-3">
                <IconComponent className={`w-5 h-5 ${alert.color} mt-0.5 flex-shrink-0`} />
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm ${alert.color} mb-1`}>
                    {alert.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
