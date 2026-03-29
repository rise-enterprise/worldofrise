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
      screens: { "2xl": "1400px" },
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
          crystal: "hsl(var(--tier-crystal))",
          onyx: "hsl(var(--tier-onyx))",
          obsidian: "hsl(var(--tier-obsidian))",
          royal: "hsl(var(--tier-royal))",
        },
        sapphire: "hsl(var(--sapphire))",
        "burgundy-crystal": "hsl(var(--burgundy-crystal))",
        "crystal-white": "hsl(var(--crystal-white))",
        neon: {
          purple: "hsl(var(--neon-purple))",
          "purple-light": "hsl(var(--neon-purple-light))",
          magenta: "hsl(var(--neon-magenta))",
          "magenta-light": "hsl(var(--neon-magenta-light))",
          blue: "hsl(var(--neon-blue))",
          "blue-light": "hsl(var(--neon-blue-light))",
          cyan: "hsl(var(--neon-cyan))",
          glow: "hsl(var(--neon-glow))",
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
        display: ["Cormorant Garamond", "Noto Naskh Arabic", "Georgia", "serif"],
        "arabic-display": ["Noto Naskh Arabic", "serif"],
        body: ["Inter", "IBM Plex Sans Arabic", "sans-serif"],
        sans: ["Inter", "IBM Plex Sans Arabic", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        crystal: "0.03em",
        refined: "0.02em",
        ceremonial: "0.06em",
        regal: "0.12em",
        wide: "0.06em",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        obsidian: "0 1px 3px 0 hsl(0 0% 0% / 0.04)",
        "obsidian-lg": "0 4px 12px -4px hsl(0 0% 0% / 0.08)",
        "gold-glow": "0 0 16px -8px hsl(38 35% 48% / 0.1)",
        "gold-glow-lg": "0 0 24px -8px hsl(38 35% 48% / 0.15)",
        medallion: "0 4px 16px -4px hsl(38 35% 48% / 0.1)",
        glass: "0 1px 4px -1px hsl(0 0% 0% / 0.04)",
        crystal: "0 2px 8px -2px hsl(0 0% 0% / 0.06)",
        luxury: "0 8px 30px -12px hsl(0 0% 0% / 0.08)",
      },
      transitionDuration: {
        crystal: "700ms",
        slow: "900ms",
        "220": "220ms",
        "400": "400ms",
      },
      transitionTimingFunction: {
        crystal: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        cinematic: "cubic-bezier(0.33, 1, 0.68, 1)",
        luxury: "cubic-bezier(0.25, 0.1, 0.25, 1)",
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
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "soft-reveal": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "gentle-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-up": "slide-up 0.6s ease-out forwards",
        "soft-reveal": "soft-reveal 600ms ease-out forwards",
        "gentle-pulse": "gentle-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;