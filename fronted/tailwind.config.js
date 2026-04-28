/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        mongo: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#00ed64",
          600: "#00c853",
          700: "#00a35c",
          800: "#00684A",
          900: "#0b3b2e",
        },
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15,23,42,0.06)",
        strong: "0 25px 70px rgba(15,23,42,0.08)",
        glow: "0 0 30px rgba(0,237,100,0.18)",
      },
      borderRadius: {
        premium: "32px",
      },
      backgroundImage: {
        "premium-page":
          "linear-gradient(180deg,#edf3f0_0%,#f7faf8_45%,#eef6f1_100%)",
        "premium-hero":
          "linear-gradient(to right,#0b3b2e,#00684A,#00a35c)",
        "premium-btn":
          "linear-gradient(to right,#00684A,#00a35c,#00c853)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floatSoft: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease",
        floatSoft: "floatSoft 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};