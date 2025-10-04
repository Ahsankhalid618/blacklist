"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorMessage({
  title = "An error occurred",
  message,
  onRetry,
  className = "",
}: ErrorMessageProps) {
  return (
    <div
      className={`bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg ${className}`}
    >
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h3 className="font-medium mb-1">{title}</h3>
          <p className="text-sm">{message}</p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 flex items-center text-sm px-3 py-1 rounded-md bg-red-500/20 hover:bg-red-500/30 transition-colors"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
