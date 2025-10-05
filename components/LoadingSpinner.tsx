"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = "md",
  message = "Loading...",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent ${sizeClasses[size]} mb-3`}
      ></div>
      {message && <p className="text-gray-400 text-sm">{message}</p>}
    </div>
  );
}
