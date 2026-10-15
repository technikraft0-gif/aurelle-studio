/* Aurelle Studio — shared Tailwind configuration.
   Load this before the Tailwind Play CDN script. */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ivory: "#F7F2EA",
        cream: "#EFE7DB",
        white: "#FFFFFF",
        espresso: "#2A1F1A",
        "espresso-soft": "#6B5E55",
        clay: "#B5654A",
        "clay-hover": "#9A503A",
        gold: "#C9A66B",
        success: "#4F7A5A",
        "success-bg": "#E3EEE5",
        warning: "#B98A2E",
        "warning-bg": "#F6EBCF",
        danger: "#B04A3F",
        "danger-bg": "#F6DFDB",
        info: "#6B5E55",
        "info-bg": "#ECE6DE",
        line: "#E4DCD1"
      },
      fontFamily: {
        sans: ["DM Sans", "Inter", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"]
      },
      boxShadow: {
        soft: "0 4px 20px rgba(42, 31, 26, 0.045)",
        pop: "0 14px 45px rgba(42, 31, 26, 0.14)"
      },
      borderRadius: {
        card: "16px"
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem"
      },
      animation: {
        "fade-in": "fadeIn .22s ease-out",
        "slide-up": "slideUp .25s ease-out",
        "pulse-soft": "pulseSoft 1.6s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: ".55" },
          "50%": { opacity: "1" }
        }
      }
    }
  }
};