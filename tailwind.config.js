/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Bu kodlar, sistemin nerede olursa olsun tasarım kodlarını okumasını sağlar
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
