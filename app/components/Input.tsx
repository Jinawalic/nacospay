import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, icon, className = '', ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-nacos transition-colors">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full bg-gray-100 dark:border-gray-700 rounded-sm px-4 py-3 text-gray-900  placeholder:text-gray-500 focus:outline-gray-500 focus:ring-0 focus:border-nacos transition-all ${icon ? 'pl-11' : ''} ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500 font-medium ml-1">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
