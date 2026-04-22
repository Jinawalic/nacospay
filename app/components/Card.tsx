import React from 'react';

export function Card({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-white  border-gray-100/10 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
}
