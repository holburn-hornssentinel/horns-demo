/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'horns-dark': '#0a0a0f',
        'horns-darker': '#050508',
        'horns-gray': '#1a1a24',
        'horns-light': '#2a2a3a',
        'horns-blue': '#3b82f6',
        'horns-purple': '#8b5cf6',
        'horns-red': '#ef4444',
        'horns-orange': '#f97316',
        'horns-yellow': '#eab308',
        'horns-green': '#22c55e',
      },
    },
  },
  plugins: [],
}
