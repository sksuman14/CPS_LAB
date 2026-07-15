import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        white: 'rgb(var(--color-white) / <alpha-value>)',
        black: 'rgb(var(--color-black) / <alpha-value>)',
        // Legacy colors to prevent breaking existing components
        'cps-blue': '#2563eb',
        'cps-teal': '#0f766e',
        'cps-dark': '#0f172a',
        'cps-dark-card': '#1e293b',
        // Stitch Generated Design System
        "on-tertiary": 'rgb(var(--on-tertiary) / <alpha-value>)',
        "surface-bright": 'rgb(var(--surface-bright) / <alpha-value>)',
        "outline-variant": 'rgb(var(--outline-variant) / <alpha-value>)',
        "on-tertiary-fixed-variant": 'rgb(var(--on-tertiary-fixed-variant) / <alpha-value>)',
        "on-secondary-fixed-variant": 'rgb(var(--on-secondary-fixed-variant) / <alpha-value>)',
        "on-tertiary-container": 'rgb(var(--on-tertiary-container) / <alpha-value>)',
        "on-secondary": 'rgb(var(--on-secondary) / <alpha-value>)',
        "tertiary-container": 'rgb(var(--tertiary-container) / <alpha-value>)',
        "on-background": 'rgb(var(--on-background) / <alpha-value>)',
        "secondary-fixed": 'rgb(var(--secondary-fixed) / <alpha-value>)',
        "surface-variant": 'rgb(var(--surface-variant) / <alpha-value>)',
        "on-secondary-fixed": 'rgb(var(--on-secondary-fixed) / <alpha-value>)',
        "on-surface": 'rgb(var(--on-surface) / <alpha-value>)',
        "on-tertiary-fixed": 'rgb(var(--on-tertiary-fixed) / <alpha-value>)',
        "surface-tint": 'rgb(var(--surface-tint) / <alpha-value>)',
        "primary-fixed": 'rgb(var(--primary-fixed) / <alpha-value>)',
        "tertiary-fixed": 'rgb(var(--tertiary-fixed) / <alpha-value>)',
        "surface": 'rgb(var(--surface) / <alpha-value>)',
        "surface-container-low": 'rgb(var(--surface-container-low) / <alpha-value>)',
        "primary-fixed-dim": 'rgb(var(--primary-fixed-dim) / <alpha-value>)',
        "inverse-surface": 'rgb(var(--inverse-surface) / <alpha-value>)',
        "surface-container-lowest": 'rgb(var(--surface-container-lowest) / <alpha-value>)',
        "outline": 'rgb(var(--outline) / <alpha-value>)',
        "on-secondary-container": 'rgb(var(--on-secondary-container) / <alpha-value>)',
        "on-primary": 'rgb(var(--on-primary) / <alpha-value>)',
        "error-container": 'rgb(var(--error-container) / <alpha-value>)',
        "tertiary-fixed-dim": 'rgb(var(--tertiary-fixed-dim) / <alpha-value>)',
        "on-primary-fixed-variant": 'rgb(var(--on-primary-fixed-variant) / <alpha-value>)',
        "on-primary-container": 'rgb(var(--on-primary-container) / <alpha-value>)',
        "error": 'rgb(var(--error) / <alpha-value>)',
        "background": 'rgb(var(--background) / <alpha-value>)', // Custom deep dark
        "on-primary-fixed": 'rgb(var(--on-primary-fixed) / <alpha-value>)',
        "secondary-container": 'rgb(var(--secondary-container) / <alpha-value>)',
        "inverse-on-surface": 'rgb(var(--inverse-on-surface) / <alpha-value>)',
        "surface-container": 'rgb(var(--surface-container) / <alpha-value>)',
        "on-error-container": 'rgb(var(--on-error-container) / <alpha-value>)',
        "surface-dim": 'rgb(var(--surface-dim) / <alpha-value>)',
        "surface-container-highest": 'rgb(var(--surface-container-highest) / <alpha-value>)',
        "surface-container-high": 'rgb(var(--surface-container-high) / <alpha-value>)',
        "primary-container": 'rgb(var(--primary-container) / <alpha-value>)',
        "inverse-primary": 'rgb(var(--inverse-primary) / <alpha-value>)',
        "secondary-fixed-dim": 'rgb(var(--secondary-fixed-dim) / <alpha-value>)',
        "secondary": 'rgb(var(--secondary) / <alpha-value>)',
        "primary": 'rgb(var(--primary) / <alpha-value>)',
        "on-surface-variant": 'rgb(var(--on-surface-variant) / <alpha-value>)',
        "tertiary": 'rgb(var(--tertiary) / <alpha-value>)',
        "on-error": 'rgb(var(--on-error) / <alpha-value>)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(to right bottom, #2563eb, #0f766e)',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        headline: ["Space Grotesk", "sans-serif"],
        body: ["Manrope", "sans-serif"],
        label: ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.125rem", 
        "lg": "0.25rem", 
        "xl": "0.5rem", 
        "full": "0.75rem"
      },
    },
  },
  plugins: [],
}
export default config
