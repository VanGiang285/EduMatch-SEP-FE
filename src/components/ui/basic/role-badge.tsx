import * as React from "react";
import { Badge } from "./badge";
import { cn } from "../utils";

export type UserRole = "learner" | "tutor" | "business-admin" | "system-admin";

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
  children?: React.ReactNode;
}

const roleConfig = {
  learner: {
    label: "Học viên",
    variant: "learner" as const,
    icon: "👨‍🎓",
  },
  tutor: {
    label: "Gia sư",
    variant: "tutor" as const,
    icon: "👨‍🏫",
  },
  "business-admin": {
    label: "Quản trị viên",
    variant: "business-admin" as const,
    icon: "👨‍💼",
  },
  "system-admin": {
    label: "Quản trị hệ thống",
    variant: "system-admin" as const,
    icon: "👨‍💻",
  },
};

export function RoleBadge({ role, className, children }: RoleBadgeProps) {
  const config = roleConfig[role];
  
  return (
    <Badge
      variant="secondary" 
      className={cn(
        "flex items-center gap-1.5",
        {
          "bg-blue-100 text-blue-800": role === "learner",
          "bg-green-100 text-green-800": role === "tutor",
          "bg-yellow-100 text-yellow-800": role === "business-admin",
          "bg-red-100 text-red-800": role === "system-admin",
        },
        className
      )}
    >
      <span className="text-xs">{config.icon}</span>
      {children || config.label}
    </Badge>
  );
}

// Utility function to get role colors
export function getRoleColors(role: UserRole) {
  const colorMap = {
    learner: {
      primary: "text-learner-primary",
      secondary: "bg-learner-secondary",
      border: "border-learner-primary",
    },
    tutor: {
      primary: "text-tutor-primary",
      secondary: "bg-tutor-secondary",
      border: "border-tutor-primary",
    },
    "business-admin": {
      primary: "text-business-admin-primary",
      secondary: "bg-business-admin-secondary",
      border: "border-business-admin-primary",
    },
    "system-admin": {
      primary: "text-system-admin-primary",
      secondary: "bg-system-admin-secondary",
      border: "border-system-admin-primary",
    },
  };
  
  return colorMap[role];
}

// Utility function to get role-based card styling
export function getRoleCardClass(role: UserRole) {
  const colors = getRoleColors(role);
  return cn(
    "border-l-4",
    colors.border,
    "hover:shadow-lg transition-all"
  );
}


