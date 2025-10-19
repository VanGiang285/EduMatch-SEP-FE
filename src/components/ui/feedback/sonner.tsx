"use client";
import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  
  return (
    <Sonner
      theme={(theme as "light" | "dark" | "system") || "system"}
      className="toaster group"
      position="top-right"
      toastOptions={{
        style: {
          marginTop: '40px',
        },
        className: "bg-white border border-gray-200 shadow-lg",
        classNames: {
          title: "text-gray-900 font-semibold",
          description: "text-gray-600",
          actionButton: "bg-[#257180] text-white hover:bg-[#1e5a66]",
          cancelButton: "bg-gray-100 text-gray-700 hover:bg-gray-200",
          closeButton: "text-gray-400 hover:text-gray-600",
        }
      }}
      {...props}
    />
  );
};

export { Toaster };
