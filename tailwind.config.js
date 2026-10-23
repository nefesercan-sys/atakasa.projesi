/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        marka: { DEFAULT: "#0f9d6b", koyu: "#0b7a53", acik: "#e7f7f0" },
      },
    },
  },
  plugins: [],
};
