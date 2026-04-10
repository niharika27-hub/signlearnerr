/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', "sans-serif"],
        body: ['"Manrope"', "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(87, 181, 231, 0.35)",
        soft: "0 20px 60px rgba(4, 14, 24, 0.45)",
      },
      backgroundImage: {
        "aurora-gradient":
          "radial-gradient(circle at 20% 20%, rgba(72, 196, 255, 0.25), transparent 35%), radial-gradient(circle at 80% 30%, rgba(123, 97, 255, 0.25), transparent 42%), radial-gradient(circle at 50% 80%, rgba(58, 227, 174, 0.18), transparent 48%)",
      },
    },
  },
  plugins: [],
};
