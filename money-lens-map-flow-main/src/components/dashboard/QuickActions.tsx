import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, Map, CreditCard, BarChart3, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

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