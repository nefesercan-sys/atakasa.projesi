/** @type {import('tailwindcss').Config} */
module.exports = {
  // ⚡ SİBER TARAYICI: Tailwind'in hangi klasörlerdeki kodları okuyacağını belirtir
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: { 
          dark: "#030712", 
          card: "#0b0f19", 
          neon: "#00f260" 
        }
      },
      // 🚀 BİLİNÇALTI SLOGANLARI İÇİN KAYAN YAZI MOTORU
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'marquee-fast': 'marquee 15s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
};
