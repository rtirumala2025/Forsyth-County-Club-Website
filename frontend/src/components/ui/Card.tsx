import React from 'react';

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'soft',
  className = '',
  ...props
}) => {
  // Base styles
  const baseStyles = 'bg-white rounded-xl border border-gray-200 transition-all duration-200';
  
  // Variant styles
  const variants = {
    default: 'bg-white',
    elevated: 'bg-white shadow-medium hover:shadow-hard',
    outlined: 'bg-white border-2 border-gray-300',
    filled: 'bg-gray-50 border-gray-200',
    glass: 'glass border-white/20',
    dark: 'bg-dark-800 border-dark-700 text-white'
  };
  
  // Padding styles
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };
  
  // Shadow styles
  const shadows = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    hard: 'shadow-hard',
    glow: 'shadow-glow',
    'glow-green': 'shadow-glow-green',
    'glow-purple': 'shadow-glow-purple'
  };
  
  // Combine all styles
  const cardStyles = [
    baseStyles,
    variants[variant],
    paddings[padding],
    shadows[shadow],
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={cardStyles} {...props}>
      {children}
    </div>
  );
};

// Card subcomponents
const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-gray-600 ${className}`} {...props}>
    {children}
  </p>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

// Attach subcomponents to Card
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
