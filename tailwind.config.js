/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // 🚀 src içindeki HER ŞEYİ tara
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // 🚀 (Önlem amaçlı) ana dizindeki app klasörünü tara
  ],
  theme: {
    extend: {
      animation: {
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      },
    },
  },
  plugins: [],
}
