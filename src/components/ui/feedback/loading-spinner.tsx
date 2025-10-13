import * as React from "react";
import { cn } from "../utils";
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}
const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8", 
  lg: "h-12 w-12",
};
export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-b-2 border-primary",
        sizeClasses[size],
        className
      )}
    />
  );
}
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    </div>
  );
}
export function InlineLoading({ text = "Đang tải..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <LoadingSpinner size="sm" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}