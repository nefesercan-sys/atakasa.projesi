/** @type {import('tailwindcss').Config} */
module.exports = {
  // ⚡ SİBER TARAYICI: Tailwind'in hangi klasörlerdeki kodları okuyacağını belirtir
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: "#030712",
          card: "#0b0f19",
          neon: "#00f260"
        }
      }
    },
  },
  plugins: [],
};
