import React from 'react';
import { createAccessibleButton } from '../../utils/accessibility';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant styles
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-soft hover:shadow-medium',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500 border border-secondary-300',
    outline: 'bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'bg-transparent text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500',
    danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 shadow-soft hover:shadow-medium',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-soft hover:shadow-medium',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 shadow-soft hover:shadow-medium',
    link: 'bg-transparent text-primary-600 hover:text-primary-700 focus:ring-primary-500 underline-offset-4 hover:underline'
  };
  
  // Size styles
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };
  
  // Loading styles
  const loadingStyles = loading ? 'cursor-wait' : '';
  
  // Full width styles
  const fullWidthStyles = fullWidth ? 'w-full' : '';
  
  // Combine all styles
  const buttonStyles = [
    baseStyles,
    variants[variant],
    sizes[size],
    loadingStyles,
    fullWidthStyles,
    className
  ].filter(Boolean).join(' ');
  
  // Loading spinner component
  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
  
  return (
    <button
      type={type}
      className={buttonStyles}
      disabled={disabled || loading}
      onClick={onClick}
      {...createAccessibleButton(children, loading, disabled)}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
};

export default Button;
