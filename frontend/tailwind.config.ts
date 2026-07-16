import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        mono: ['var(--font-jetbrains-mono)', ...fontFamily.mono],
      },
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--primary-rgb) / <alpha-value>)',  /* Aurora teal #64FFDA */
          50: 'rgb(var(--primary-rgb) / 0.05)',
          100: 'rgb(var(--primary-rgb) / 0.1)',
          200: 'rgb(var(--primary-rgb) / 0.2)',
          300: 'rgb(var(--primary-rgb) / 0.4)',
          400: 'rgb(var(--primary-rgb) / 0.6)',
          500: 'rgb(var(--primary-rgb) / <alpha-value>)',
          600: 'rgb(var(--primary-rgb) / 0.8)',
          700: 'rgb(var(--primary-rgb) / 0.9)',
          800: 'rgb(var(--primary-rgb) / 0.95)',
          900: 'rgb(var(--primary-rgb) / 1)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary-rgb) / <alpha-value>)',  /* Electric purple #A855F7 */
          50: 'rgb(var(--secondary-rgb) / 0.05)',
          100: 'rgb(var(--secondary-rgb) / 0.1)',
          200: 'rgb(var(--secondary-rgb) / 0.2)',
          300: 'rgb(var(--secondary-rgb) / 0.4)',
          400: 'rgb(var(--secondary-rgb) / 0.6)',
          500: 'rgb(var(--secondary-rgb) / <alpha-value>)',
          600: 'rgb(var(--secondary-rgb) / 0.8)',
          700: 'rgb(var(--secondary-rgb) / 0.9)',
          800: 'rgb(var(--secondary-rgb) / 0.95)',
          900: 'rgb(var(--secondary-rgb) / 1)',
        },
        tertiary: {
          DEFAULT: 'rgb(var(--tertiary-rgb) / <alpha-value>)',  /* Lava orange #FF4500 */
          50: 'rgb(var(--tertiary-rgb) / 0.05)',
          100: 'rgb(var(--tertiary-rgb) / 0.1)',
          200: 'rgb(var(--tertiary-rgb) / 0.2)',
          300: 'rgb(var(--tertiary-rgb) / 0.4)',
          400: 'rgb(var(--tertiary-rgb) / 0.6)',
          500: 'rgb(var(--tertiary-rgb) / <alpha-value>)',
          600: 'rgb(var(--tertiary-rgb) / 0.8)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',  /* Aurora sky #38BDF8 */
          50: 'rgb(var(--accent-rgb) / 0.05)',
          100: 'rgb(var(--accent-rgb) / 0.1)',
          200: 'rgb(var(--accent-rgb) / 0.2)',
          300: 'rgb(var(--accent-rgb) / 0.4)',
          400: 'rgb(var(--accent-rgb) / 0.6)',
          500: 'rgb(var(--accent-rgb) / <alpha-value>)',
          600: 'rgb(var(--accent-rgb) / 0.8)',
          700: 'rgb(var(--accent-rgb) / 0.9)',
          800: 'rgb(var(--accent-rgb) / 0.95)',
          900: 'rgb(var(--accent-rgb) / 1)',
        },
        highlight: {
          DEFAULT: 'rgb(var(--highlight-rgb) / <alpha-value>)',  /* Lava gold #FFD166 */
          100: 'rgb(var(--highlight-rgb) / 0.1)',
          200: 'rgb(var(--highlight-rgb) / 0.2)',
        },
        background: {
          DEFAULT: 'rgb(var(--background-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--background-secondary-rgb) / <alpha-value>)',
          tertiary: 'rgb(var(--background-secondary-rgb) / 0.8)',
        },
        card: {
          DEFAULT: 'rgb(var(--card-rgb) / <alpha-value>)',
          hover: 'rgb(var(--card-hover-rgb) / <alpha-value>)',
          border: 'rgba(var(--foreground-rgb), var(--border-opacity))',
        },
        surface: {
          1: 'rgb(var(--surface-1-rgb) / <alpha-value>)',
          2: 'rgb(var(--surface-2-rgb) / <alpha-value>)',
          3: 'rgb(var(--surface-3-rgb) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgba(248, 250, 252, 0.35)',
          foreground: 'rgba(248, 250, 252, 0.45)',
        },
        destructive: {
          DEFAULT: '#FF4500',  /* Lava orange */
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#22C55E',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#FFD166',  /* Lava gold */
          foreground: '#000000',
        },
        border: 'rgba(var(--border-rgb), var(--border-opacity))',
        input: 'rgba(var(--foreground-rgb), var(--input-opacity))',
        ring: 'rgb(var(--primary-rgb) / <alpha-value>)',
        foreground: 'rgb(var(--foreground-rgb) / <alpha-value>)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 16px)',
      },
      backgroundImage: {
        /* Tri-theme gradients: Aurora × Electric Purple × Lava */
        'gradient-primary': 'linear-gradient(135deg, #64FFDA 0%, #A855F7 50%, #FF4500 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #64FFDA 0%, #38BDF8 100%)',
        'gradient-lava': 'linear-gradient(135deg, #FF4500 0%, #FF6B35 50%, #FFD166 100%)',
        'gradient-purple': 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
        'gradient-accent': 'linear-gradient(135deg, #64FFDA 0%, #38BDF8 50%, #A855F7 100%)',
        'gradient-dark': 'linear-gradient(180deg, rgb(var(--background-rgb)) 0%, rgb(var(--background-secondary-rgb)) 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(100,255,218,0.06) 0%, rgba(168,85,247,0.04) 50%, rgba(255,69,0,0.03) 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': `
          radial-gradient(at 15% 15%, rgba(100,255,218,0.12) 0px, transparent 50%),
          radial-gradient(at 85% 10%, rgba(255,69,0,0.10) 0px, transparent 50%),
          radial-gradient(at 50% 50%, rgba(168,85,247,0.08) 0px, transparent 50%),
          radial-gradient(at 90% 90%, rgba(56,189,248,0.08) 0px, transparent 50%)
        `,
      },
      boxShadow: {
        'glow-primary': '0 0 30px rgba(100, 255, 218, 0.4), 0 0 60px rgba(100, 255, 218, 0.15)',
        'glow-secondary': '0 0 30px rgba(168, 85, 247, 0.4), 0 0 60px rgba(168, 85, 247, 0.15)',
        'glow-lava': '0 0 30px rgba(255, 69, 0, 0.4), 0 0 60px rgba(255, 69, 0, 0.15)',
        'glow-accent': '0 0 30px rgba(56, 189, 248, 0.4)',
        'glow-sm': '0 0 14px rgba(100, 255, 218, 0.3)',
        'glow-purple-sm': '0 0 14px rgba(168, 85, 247, 0.35)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.7)',
        'inner-glow': 'inset 0 0 20px rgba(100, 255, 218, 0.07)',
        'tri-glow': '0 0 40px rgba(100,255,218,0.2), 0 0 80px rgba(168,85,247,0.15), 0 0 120px rgba(255,69,0,0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'fade-up': 'fadeUp 0.5s ease forwards',
        'slide-in-left': 'slideInLeft 0.3s ease forwards',
        'slide-in-right': 'slideInRight 0.3s ease forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'gradient-shift': 'gradientShift 6s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'counter': 'counter 2s ease-out forwards',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInLeft: { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        slideInRight: { from: { opacity: '0', transform: 'translateX(20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(var(--primary-rgb) / 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(var(--primary-rgb) / 0.8)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};

export default config;
