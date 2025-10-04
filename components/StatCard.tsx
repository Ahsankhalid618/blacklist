'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
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

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className = ''
}: StatCardProps) {
  return (
    <div className={`glass-card p-6 flex flex-col ${className}`}>
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-blue-300">{title}</h3>
        {Icon && (
          <div className="rounded-full bg-blue-500/20 p-2">
            <Icon size={16} className="text-blue-300" />
          </div>
        )}
      </div>
      
      <div className="flex items-baseline mt-2">
        <p className="text-3xl font-bold">{value}</p>
        
        {trend && (
          <div className={`ml-2 flex items-center text-sm ${
            trend.isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            <span className="mr-1">
              {trend.isPositive ? '↑' : '↓'}
            </span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-gray-300 mt-2">{description}</p>
      )}
    </div>
  );
}
