import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  variant = "default",
  className,
}: StatsCardProps) {
  const variantClasses = {
    default: "card-gradient",
    primary: "card-primary",
    success: "card-success",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
  };

  const changeClasses = {
    positive: "text-success-high-contrast",
    negative: "text-danger",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className={cn("stats-card", variantClasses[variant], className)}>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex-1 min-w-0 overflow-hidden pr-4">
            <p className="font-medium opacity-80 mb-1">{title}</p>
            <div className="flex flex-col gap-0.5">
              <h3 className="font-bold">{value}</h3>
              {change && (
                <span className={cn("font-medium text-lg", changeClasses[changeType])}>
                  {change}
                </span>
              )}
            </div>
          </div>
          <div className="p-1.5 sm:p-2 lg:p-3 rounded-lg bg-white/10 backdrop-blur-sm flex-shrink-0 ml-4">
            <div className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}