/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        juniper: "#3C4D4A",
        sage: "#566057",
        sand: "#F6F2E8",
        sun: "#BA9D4C",
        brain: "#CCB6A3",
        sky: "#B4C3BC",
      },
      fontFamily: {
        display: ['"Unbounded"', "system-ui", "sans-serif"],
        tagline: ['"Termina Demi"', "Unbounded", "sans-serif"],
        body: ['"Telugu MN"', "Georgia", "serif"],
        callout: ['"Baskerville"', "Georgia", "serif"],
      },
      letterSpacing: { tracked: "0.5em" },
      borderRadius: { pill: "9999px" },
    },
  },
  plugins: [],
};
