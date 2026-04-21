import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        xs: ["14px", { lineHeight: "1rem" }],
        sm: ["16px", { lineHeight: "1.25rem" }],
        base: ["18px", { lineHeight: "1.5rem" }],
        lg: ["20px", { lineHeight: "1.75rem" }],
        xl: ["22px", { lineHeight: "1.75rem" }],
        "2xl": ["26px", { lineHeight: "2rem" }],
        "3xl": ["32px", { lineHeight: "2.25rem" }],
        "4xl": ["38px", { lineHeight: "2.5rem" }],
        "5xl": ["50px", { lineHeight: "1" }],
        "6xl": ["62px", { lineHeight: "1" }],
        "7xl": ["74px", { lineHeight: "1" }],
        "8xl": ["98px", { lineHeight: "1" }],
        "9xl": ["130px", { lineHeight: "1" }],
        "page-title": ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        "section-label": [
          "11px",
          {
            lineHeight: "1.2",
            fontWeight: "500",
            letterSpacing: "0.08em",
          },
        ],
        body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "card-title": ["15px", { lineHeight: "1.35", fontWeight: "600" }],
        nav: ["14px", { lineHeight: "1.4" }],
        "source-anchor": ["12px", { lineHeight: "1.4" }],
        "top-brand": ["15px", { lineHeight: "1.3", fontWeight: "600" }],
        "top-tier": ["13px", { lineHeight: "1.3" }],
        "sidebar-brand": ["14px", { lineHeight: "1.3", fontWeight: "600" }],
        "sidebar-tier": ["12px", { lineHeight: "1.3" }],
      },
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
        teal: { DEFAULT: "#0B7275", light: "#E6F4F4" },
        red: { DEFAULT: "#CC2222", light: "#FFF5F5" },
        amber: { DEFAULT: "#B85A1A", light: "#FFF0E8" },
        green: { DEFAULT: "#1A7A4A", light: "#F0FAF4" },
        purple: { DEFAULT: "#544AA0", light: "#F3F1FC" },
        gold: { DEFAULT: "#BA8C28", light: "#FBF5E6" },
        bg: { DEFAULT: "#FFFFFF", "2": "#F5F5F5", "3": "#EBEBEB" },
        "text-1": "#1A1A1A",
        "text-2": "#717171",
        "text-3": "#A3A3A3",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
