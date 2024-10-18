import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./modules/**/*.{js,ts,jsx,tsx,mdx}",
    './node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brown:{
          100: '#312217ff',
          200: '#5A3B25ff',
          300: '#83532Cff',
          400: '#B47D50ff',
          500: '#CEA17Dff',
          600: '#EDD0BAff',
          700: '#FFF7EAff',
        },
        orange: {
          100: '#72260Bff',
          200: '#A14524ff',
          300: '#D46536ff',
          400: '#DF8739ff',
          500: '#E9A73Bff',
          600: '#FFCA72ff',
          700: '#F7D08Fff',
        },
        green: {
          100: '#364937ff',
          200: '#607A61ff',
          300: '#749975ff',
          400: '#87B789ff',
          500: '#A4C7A6ff',
          600: '#C4D9C5ff',
          700: '#DEEBDFff',
        },
        background: "#FFF7EAff",
      },
      boxShadow: {
        '3xl': '20px 15px 15px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'book-pattern': "url('/bg1.png')",
      },
      width: {
        '0.3':'30%',
      },
    },
  },
  plugins: [],
};
export default config;
