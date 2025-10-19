import { toast } from "sonner";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import React from "react";

export function useCustomToast() {
  const showSuccess = (title: string, description?: string, duration = 5000) => {
    toast.custom((t) => (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm w-full">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    ), { duration });
  };

  const showError = (title: string, description?: string, duration = 5000) => {
    toast.custom((t) => (
      <div className="bg-white border border-red-200 rounded-lg shadow-lg p-4 max-w-sm w-full">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    ), { duration });
  };

  const showWarning = (title: string, description?: string, duration = 5000) => {
    toast.custom((t) => (
      <div className="bg-white border border-yellow-200 rounded-lg shadow-lg p-4 max-w-sm w-full">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    ), { duration });
  };

  const showInfo = (title: string, description?: string, duration = 5000) => {
    toast.custom((t) => (
      <div className="bg-white border border-blue-200 rounded-lg shadow-lg p-4 max-w-sm w-full">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    ), { duration });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}

