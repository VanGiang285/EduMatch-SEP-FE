import * as React from "react";
import { Badge } from "../basic/badge";
import { cn } from "../utils";

export type StatusType = "success" | "warning" | "error" | "info";

interface StatusIndicatorProps {
  status: StatusType;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

const statusConfig = {
  success: { label: "Thành công", icon: "✓" },
  warning: { label: "Cảnh báo", icon: "⚠" },
  error: { label: "Lỗi", icon: "✕" },
  info: { label: "Thông tin", icon: "ℹ" },
};

export function StatusIndicator({ 
  status, 
  children, 
  className, 
  showIcon = true 
}: StatusIndicatorProps) {
  const config = statusConfig[status];

  const statusColors = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  } as const;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "flex items-center gap-1.5",
        statusColors[status],
        className
      )}
    >
      {showIcon && <span className="text-xs">{config.icon}</span>}
      {children || config.label}
    </Badge>
  );
}

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
    <div
      className={cn(
        "p-4 rounded-lg border",
        cardClasses[status],
        className
      )}
    >
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
