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
        // Legacy colors to prevent breaking existing components
        'cps-blue': '#2563eb',
        'cps-teal': '#0f766e',
        'cps-dark': '#0f172a',
        'cps-dark-card': '#1e293b',
        // Stitch Generated Design System
        "on-tertiary": "#581e00",
        "surface-bright": "#39393b",
        "outline-variant": "#434655",
        "on-tertiary-fixed-variant": "#7d2d00",
        "on-secondary-fixed-variant": "#00504a",
        "on-tertiary-container": "#ffede6",
        "on-secondary": "#003733",
        "tertiary-container": "#bc4800",
        "on-background": "#e5e1e4",
        "secondary-fixed": "#9cf2e8",
        "surface-variant": "#353437",
        "on-secondary-fixed": "#00201d",
        "on-surface": "#e5e1e4",
        "on-tertiary-fixed": "#360f00",
        "surface-tint": "#b4c5ff",
        "primary-fixed": "#dbe1ff",
        "tertiary-fixed": "#ffdbcd",
        "surface": "#131315",
        "surface-container-low": "#1c1b1d",
        "primary-fixed-dim": "#b4c5ff",
        "inverse-surface": "#e5e1e4",
        "surface-container-lowest": "#0e0e10",
        "outline": "#8d90a0",
        "on-secondary-container": "#9af0e5",
        "on-primary": "#002a78",
        "error-container": "#93000a",
        "tertiary-fixed-dim": "#ffb596",
        "on-primary-fixed-variant": "#003ea8",
        "on-primary-container": "#eeefff",
        "error": "#ffb4ab",
        "background": "#09090b", // Custom deep dark
        "on-primary-fixed": "#00174b",
        "secondary-container": "#007068",
        "inverse-on-surface": "#313032",
        "surface-container": "#201f22",
        "on-error-container": "#ffdad6",
        "surface-dim": "#131315",
        "surface-container-highest": "#353437",
        "surface-container-high": "#2a2a2c",
        "primary-container": "#2563eb",
        "inverse-primary": "#0053db",
        "secondary-fixed-dim": "#80d5cb",
        "secondary": "#80d5cb",
        "primary": "#b4c5ff",
        "on-surface-variant": "#c3c6d7",
        "tertiary": "#ffb596",
        "on-error": "#690005"
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
