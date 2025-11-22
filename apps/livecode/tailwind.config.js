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
        'code-bg': '#1e1e1e',
        'code-sidebar': '#252526',
        'code-accent': '#007acc',
      },
    },
  },
  plugins: [],
}
