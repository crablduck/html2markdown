/**
 * 复选框组件
 */

import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export function Checkbox({
  label,
  description,
  className,
  id,
  ...props
}: CheckboxProps) {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={clsx('flex items-start', className)}>
      <div className="flex items-center h-5">
        <input
          id={checkboxId}
          type="checkbox"
          className="sr-only"
          {...props}
        />
        <label
          htmlFor={checkboxId}
          className={clsx(
            'relative flex items-center justify-center w-5 h-5 border-2 rounded cursor-pointer transition-colors',
            'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
            props.checked
              ? 'bg-blue-600 border-blue-600'
              : 'bg-white border-gray-300 hover:border-gray-400',
            props.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {props.checked && (
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          )}
        </label>
      </div>
      
      {(label || description) && (
        <div className="ml-3">
          {label && (
            <label
              htmlFor={checkboxId}
              className={clsx(
                'text-sm font-medium text-gray-900 cursor-pointer',
                props.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}