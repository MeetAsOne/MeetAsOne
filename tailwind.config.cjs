const config = {
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],

  plugins: [require('flowbite/plugin')],

  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        // flowbite-svelte
        // Generated thanks to https://www.tailwindshades.com/
        primary: {
          50: '#FFF1B2',
          100: '#FFEE9E',
          200: '#FFE775',
          300: '#FFDF4C',
          400: '#FFD824',
          500: '#FACE00',
          600: '#D1AC00',
          700: '#997E00',
          800: '#615000',
          900: '#292100',
        }
      }
    }
  }
};

module.exports = config;
