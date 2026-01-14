import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Luxury accent colors
        gold: {
          DEFAULT: "hsl(var(--gold))",
          shadow: "hsl(var(--gold-shadow))",
        },
        burgundy: "hsl(var(--burgundy))",
        teal: "hsl(var(--teal))",
        noir: {
          DEFAULT: "hsl(var(--noir))",
          accent: "hsl(var(--noir-accent))",
        },
        sasso: {
          DEFAULT: "hsl(var(--sasso))",
          accent: "hsl(var(--sasso-accent))",
        },
        tier: {
          initiation: "hsl(var(--tier-initiation))",
          connoisseur: "hsl(var(--tier-connoisseur))",
          elite: "hsl(var(--tier-elite))",
          "inner-circle": "hsl(var(--tier-inner-circle))",
          black: "hsl(var(--tier-black))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Noto Naskh Arabic", "serif"],
        "arabic-display": ["Noto Naskh Arabic", "serif"],
        body: ["IBM Plex Sans Arabic", "Inter", "sans-serif"],
        sans: ["IBM Plex Sans Arabic", "Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        crystal: "0.04em",
        refined: "0.02em",
        ceremonial: "0.08em",
        regal: "0.12em",
        wide: "0.08em",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      backdropBlur: {
        glass: "var(--blur-glass)",
        heavy: "var(--blur-heavy)",
      },
      boxShadow: {
        obsidian: "0 4px 24px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(233, 238, 247, 0.03)",
        "obsidian-lg": "0 8px 32px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(200, 162, 74, 0.05)",
        "gold-glow": "0 0 20px rgba(200, 162, 74, 0.15)",
        "gold-glow-lg": "0 0 40px rgba(200, 162, 74, 0.25)",
        medallion: "0 4px 16px rgba(200, 162, 74, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        glass: "0 4px 24px -4px rgba(0, 0, 0, 0.3)",
        crystal: "0 8px 32px -8px rgba(0, 0, 0, 0.4)",
        luxury: "0 24px 48px -12px rgba(0, 0, 0, 0.5)",
      },
      transitionDuration: {
        crystal: "700ms",
        slow: "900ms",
        "220": "220ms",
        "400": "400ms",
      },
      transitionTimingFunction: {
        crystal: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        cinematic: "cubic-bezier(0.33, 1, 0.68, 1)",
        luxury: "cubic-bezier(0.23, 1, 0.32, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "crystal-reveal": {
          from: { opacity: "0", transform: "translateY(24px)", filter: "blur(4px)" },
          to: { opacity: "1", transform: "translateY(0)", filter: "blur(0)" },
        },
        "light-shift": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.8" },
        },
        "gold-sweep": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "soft-reveal": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "gentle-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(200, 162, 74, 0.2)" },
          "50%": { borderColor: "rgba(200, 162, 74, 0.4)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-up": "slide-up 0.7s ease-out forwards",
        "crystal-reveal": "crystal-reveal 0.8s ease-out forwards",
        "light-shift": "light-shift 3s ease-in-out infinite",
        "gold-sweep": "gold-sweep 3s ease-in-out infinite",
        "soft-reveal": "soft-reveal 600ms ease-out forwards",
        "gentle-pulse": "gentle-pulse 3s ease-in-out infinite",
        "border-glow": "border-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
