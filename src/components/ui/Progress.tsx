/**
 * 进度条组件
 */

import React from 'react';
import { clsx } from 'clsx';

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'yellow';
  showLabel?: boolean;
  label?: string;
}

export function Progress({
  value,
  className,
  size = 'md',
  color = 'blue',
  showLabel = false,
  label
}: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  };
  
  return (
    <div className={clsx('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label || '进度'}
          </span>
          {showLabel && (
            <span className="text-sm text-gray-500">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      
      <div className={clsx(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={clsx(
            'h-full transition-all duration-300 ease-out rounded-full',
            colorClasses[color]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}