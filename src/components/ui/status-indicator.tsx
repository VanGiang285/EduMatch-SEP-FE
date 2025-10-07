import * as React from "react";
import { Badge } from "./badge";
import { cn } from "./utils";

export type StatusType = "success" | "warning" | "error" | "info";

interface StatusIndicatorProps {
  status: StatusType;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

const statusConfig = {
  success: {
    label: "Thành công",
    variant: "success" as const,
    icon: "✓",
  },
  warning: {
    label: "Cảnh báo", 
    variant: "warning" as const,
    icon: "⚠",
  },
  error: {
    label: "Lỗi",
    variant: "error" as const,
    icon: "✕",
  },
  info: {
    label: "Thông tin",
    variant: "default" as const,
    icon: "ℹ",
  },
};

export function StatusIndicator({ 
  status, 
  children, 
  className, 
  showIcon = true 
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  
  return (
    <Badge
      variant={config.variant}
      className={cn("flex items-center gap-1.5", className)}
    >
      {showIcon && <span className="text-xs">{config.icon}</span>}
      {children || config.label}
    </Badge>
  );
}

// Status card component
export function StatusCard({ 
  status, 
  title, 
  description, 
  className 
}: {
  status: StatusType;
  title: string;
  description: string;
  className?: string;
}) {
  const config = statusConfig[status];
  
  const cardClasses = {
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200", 
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };
  
  const textClasses = {
    success: "text-green-800",
    warning: "text-yellow-800",
    error: "text-red-800", 
    info: "text-blue-800",
  };
  
  return (
    <div className={cn(
      "p-4 rounded-lg border",
      cardClasses[status],
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{config.icon}</span>
        <h3 className={cn("font-semibold text-sm", textClasses[status])}>
          {title}
        </h3>
      </div>
      <p className={cn("text-sm", textClasses[status])}>
        {description}
      </p>
    </div>
  );
}


