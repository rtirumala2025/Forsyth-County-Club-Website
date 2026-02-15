import React, { forwardRef } from 'react';
import { createAccessibleField } from '../../utils/accessibility';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helpText,
  required = false,
  disabled = false,
  className = '',
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  ...props
}, ref) => {
  // Base styles
  const baseStyles = 'block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200';

  // State styles
  const stateStyles = error
    ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500';

  // Disabled styles
  const disabledStyles = disabled
    ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
    : 'bg-white text-gray-900';

  // Combine all styles
  const inputStyles = [
    baseStyles,
    stateStyles,
    disabledStyles,
    className
  ].filter(Boolean).join(' ');

  // Generate unique ID
  const inputId = React.useId();
  const errorId = error ? `${inputId}-error` : undefined;
  const helpId = helpText ? `${inputId}-help` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        type={type}
        className={inputStyles}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        {...createAccessibleField(label, error, helpText)}
        {...props}
      />

      {error && (
        <p
          id={errorId}
          className="mt-1 text-sm text-error-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      {helpText && !error && (
        <p
          id={helpId}
          className="mt-1 text-sm text-gray-500"
        >
          {helpText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
