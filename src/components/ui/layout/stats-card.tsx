import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "../utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  className 
}: StatsCardProps) {
  return (
    <Card className={cn("p-6", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            <span className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              so với tháng trước
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Role-based stats card
interface RoleStatsCardProps extends Omit<StatsCardProps, 'className'> {
  role: "learner" | "tutor" | "business-admin" | "system-admin";
}

export function RoleStatsCard({ role, ...props }: RoleStatsCardProps) {
  const roleColors = {
    learner: "border-l-4 border-l-learner-primary",
    tutor: "border-l-4 border-l-tutor-primary", 
    "business-admin": "border-l-4 border-l-business-admin-primary",
    "system-admin": "border-l-4 border-l-system-admin-primary",
  };

  return (
    <StatsCard 
      {...props}
      className={roleColors[role]}
    />
  );
}


