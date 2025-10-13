import * as React from "react";
import { cn } from "../utils";
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "sm" | "md" | "lg";
}
const gapClasses = {
  sm: "gap-2",
  md: "gap-4", 
  lg: "gap-6",
};
const colClasses = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};
export function ResponsiveGrid({ 
  children, 
  className, 
  cols = { default: 1, md: 2, lg: 3, xl: 4 },
  gap = "md"
}: ResponsiveGridProps) {
  const gridClasses = [
    "grid",
    gapClasses[gap],
    cols.default && colClasses[cols.default as keyof typeof colClasses],
    cols.sm && `sm:${colClasses[cols.sm as keyof typeof colClasses]}`,
    cols.md && `md:${colClasses[cols.md as keyof typeof colClasses]}`,
    cols.lg && `lg:${colClasses[cols.lg as keyof typeof colClasses]}`,
    cols.xl && `xl:${colClasses[cols.xl as keyof typeof colClasses]}`,
  ].filter(Boolean);
  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  );
}
export function Container({ 
  children, 
  className,
  size = "xl"
}: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl";
}) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "7xl": "max-w-7xl",
  };
  return (
    <div className={cn("mx-auto px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}>
      {children}
    </div>
  );
}
export function Stack({ 
  children, 
  className,
  spacing = "md"
}: {
  children: React.ReactNode;
  className?: string;
  spacing?: "sm" | "md" | "lg";
}) {
  const spacingClasses = {
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6",
  };
  return (
    <div className={cn("flex flex-col", spacingClasses[spacing], className)}>
      {children}
    </div>
  );
}