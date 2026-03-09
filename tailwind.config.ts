import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'french-blue': '#002395',
        'french-red': '#ED2939',
        'bg-primary': '#0a0f1e',
        'bg-secondary': '#111827',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 35, 149, 0.4), 0 0 40px rgba(237, 41, 57, 0.15)',
          },
          '50%': {
            boxShadow: '0 0 35px rgba(0, 35, 149, 0.6), 0 0 60px rgba(237, 41, 57, 0.25)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
