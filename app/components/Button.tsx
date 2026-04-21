import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export function Button({ variant = 'primary', fullWidth, className = '', ...props }: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:ring-4 focus:ring-nacos/20 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-nacos text-white hover:bg-nacos-hover hover:shadow-nacos/40',
    secondary: 'bg-green-50 dark:bg-nacos/10 text-nacos hover:bg-green-100 dark:hover:bg-nacos/20',
    outline: 'border-2 border-nacos text-nacos hover:bg-nacos hover:text-white',
    ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  };

  const sizes = 'px-6 py-3.5 text-sm';
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button className={`${baseClasses} ${variants[variant]} ${sizes} ${widthClasses} ${className}`} {...props} />
  );
}
