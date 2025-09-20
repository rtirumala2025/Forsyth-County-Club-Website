/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // Design tokens for consistent theming
      colors: {
        // Primary brand colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Secondary colors
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Accent colors
        accent: {
          blue: '#00D9FF',
          green: '#00FF88',
          purple: '#BD00FF',
          pink: '#FF0080',
        },
        // Status colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Dark theme colors
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      // Typography scale
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      // Font families
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      // Spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Border radius
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      // Box shadows
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.5)',
        'glow-purple': '0 0 20px rgba(147, 51, 234, 0.5)',
      },
      // Animation durations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      // Keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      // Backdrop blur
      backdropBlur: {
        xs: '2px',
      },
      // Z-index scale
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    },
  },
  plugins: [
    // Custom plugin for design system utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Text utilities
        '.text-gradient': {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-blue': {
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        // Background utilities
        '.bg-gradient-primary': {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        '.bg-gradient-secondary': {
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        },
        '.bg-gradient-dark': {
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        },
        // Glass morphism effect
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        // Neon glow effects
        '.neon-blue': {
          'box-shadow': '0 0 5px #00D9FF, 0 0 10px #00D9FF, 0 0 15px #00D9FF',
        },
        '.neon-green': {
          'box-shadow': '0 0 5px #00FF88, 0 0 10px #00FF88, 0 0 15px #00FF88',
        },
        '.neon-purple': {
          'box-shadow': '0 0 5px #BD00FF, 0 0 10px #BD00FF, 0 0 15px #BD00FF',
        },
        '.neon-pink': {
          'box-shadow': '0 0 5px #FF0080, 0 0 10px #FF0080, 0 0 15px #FF0080',
        },
        // Focus states
        '.focus-ring': {
          '&:focus': {
            'outline': 'none',
            'box-shadow': '0 0 0 3px rgba(59, 130, 246, 0.5)',
          },
        },
        '.focus-ring-success': {
          '&:focus': {
            'outline': 'none',
            'box-shadow': '0 0 0 3px rgba(34, 197, 94, 0.5)',
          },
        },
        '.focus-ring-error': {
          '&:focus': {
            'outline': 'none',
            'box-shadow': '0 0 0 3px rgba(239, 68, 68, 0.5)',
          },
        },
        // Screen reader only
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          'white-space': 'nowrap',
          border: '0',
        },
        // Scrollbar styling
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': theme('colors.gray.300') + ' transparent',
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '6px',
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          'background-color': theme('colors.gray.300'),
          'border-radius': '3px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          'background-color': theme('colors.gray.400'),
        },
      };
      
      addUtilities(newUtilities);
    }
  ],
  // Dark mode configuration
  darkMode: 'class',
  // Safelist for dynamic classes
  safelist: [
    'bg-blue-100',
    'bg-green-100',
    'bg-purple-100',
    'bg-pink-100',
    'text-blue-800',
    'text-green-800',
    'text-purple-800',
    'text-pink-800',
  ]
};
