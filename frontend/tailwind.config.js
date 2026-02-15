/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    /* ── Sawnee & Slate — Forsyth County Design System ──── */
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',

      /* Prussian Blue — the commanding base */
      'fcs-blue': {
        DEFAULT: '#00284C',
        50: '#E6EEF5',
        100: '#B3CCDE',
        200: '#809BC0',
        300: '#4D6BA2',
        400: '#1A3A84',
        500: '#00284C',
        600: '#002040',
        700: '#001833',
        800: '#001027',
        900: '#00081A',
      },

      /* Buddha Gold — sharp, sparingly used accent */
      'fcs-gold': {
        DEFAULT: '#C99600',
        50: '#FFF9E6',
        100: '#FFEEB3',
        200: '#FFE280',
        300: '#FFD64D',
        400: '#FFCA1A',
        500: '#C99600',
        600: '#A67C00',
        700: '#836200',
        800: '#604800',
        900: '#3D2E00',
      },

      /* Sawnee Stone — warm limestone greys */
      stone: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },

      /* Lake Lanier — secondary cool accent */
      teal: {
        DEFAULT: '#0e7490',
        50: '#E6F5F8',
        100: '#B3E0E9',
        200: '#80CCDB',
        300: '#4DB7CC',
        400: '#1AA3BE',
        500: '#0e7490',
        600: '#0B5D73',
        700: '#084657',
        800: '#052F3A',
        900: '#03181D',
      },

      /* Utility colors — keeping these minimal */
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },

      red: { 500: '#EF4444', 600: '#DC2626', 700: '#B91C1C' },
      green: { 500: '#22C55E', 600: '#16A34A', 700: '#15803D' },
      blue: { 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8', 100: '#DBEAFE', 50: '#EFF6FF' },
      yellow: { 500: '#F59E0B', 600: '#D97706' },
      indigo: { 50: '#EEF2FF', 100: '#E0E7FF', 500: '#6366F1', 600: '#4F46E5' },
      purple: { 100: '#F3E8FF', 500: '#A855F7', 600: '#9333EA' },
      pink: { 100: '#FCE7F3', 500: '#EC4899' },
      cyan: { 500: '#06B6D4' },
      slate: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B', 900: '#0F172A' },
    },

    fontFamily: {
      heading: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      body: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },

    extend: {
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.05' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      borderRadius: {
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
      },

      boxShadow: {
        'hard': '4px 4px 0px 0px #00284C',
        'hard-sm': '2px 2px 0px 0px #00284C',
        'hard-gold': '4px 4px 0px 0px #C99600',
        'soft': '0 1px 3px 0 rgba(0, 40, 76, 0.08)',
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.focus-ring': {
          '&:focus': {
            outline: 'none',
            'box-shadow': '0 0 0 3px rgba(0, 40, 76, 0.3)',
          },
        },
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
      });
    },
  ],
  darkMode: 'class',
  safelist: [
    'bg-blue-100',
    'bg-green-100',
    'bg-purple-100',
    'bg-pink-100',
    'text-blue-800',
    'text-green-800',
    'text-purple-800',
    'text-pink-800',
    'bg-fcs-blue',
    'bg-fcs-gold',
    'text-fcs-blue',
    'text-fcs-gold',
    'bg-stone-100',
    'bg-stone-50',
    { pattern: /bg-(stone|gray|slate)-(50|100|200|300)/ },
  ],
};
