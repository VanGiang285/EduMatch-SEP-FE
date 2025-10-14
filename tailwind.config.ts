import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        red: {
          50: 'oklch(.971 .013 17.38)',
          100: 'oklch(.936 .032 17.717)',
          200: 'oklch(.885 .062 18.334)',
          500: 'oklch(.637 .237 25.331)',
          600: 'oklch(.577 .245 27.325)',
          700: 'oklch(.505 .213 27.518)',
          800: 'oklch(.444 .177 26.899)',
          900: 'oklch(.396 .141 25.723)',
        },
        orange: {
          50: 'oklch(.98 .016 73.684)',
          100: 'oklch(.954 .038 75.164)',
          300: 'oklch(.837 .128 66.29)',
          500: 'oklch(.705 .213 47.604)',
          600: 'oklch(.646 .222 41.116)',
        },
        yellow: {
          50: 'oklch(.987 .026 102.212)',
          100: 'oklch(.973 .071 103.193)',
          200: 'oklch(.945 .129 101.54)',
          400: 'oklch(.852 .199 91.936)',
          500: 'oklch(.795 .184 86.047)',
          600: 'oklch(.681 .162 75.834)',
          700: 'oklch(.554 .135 66.442)',
          800: 'oklch(.476 .114 61.907)',
          900: 'oklch(.421 .095 57.708)',
        },
        green: {
          50: 'oklch(.982 .018 155.826)',
          100: 'oklch(.962 .044 156.743)',
          200: 'oklch(.925 .084 155.995)',
          500: 'oklch(.723 .219 149.579)',
          600: 'oklch(.627 .194 149.214)',
          700: 'oklch(.527 .154 150.069)',
          800: 'oklch(.448 .119 151.328)',
          900: 'oklch(.393 .095 152.535)',
        },
        teal: {
          100: 'oklch(.953 .051 180.801)',
          600: 'oklch(.6 .118 184.704)',
        },
        blue: {
          50: 'oklch(.97 .014 254.604)',
          100: 'oklch(.932 .032 255.585)',
          200: 'oklch(.882 .059 254.128)',
          300: 'oklch(.809 .105 251.813)',
          500: 'oklch(.623 .214 259.815)',
          600: 'oklch(.546 .245 262.881)',
          700: 'oklch(.488 .243 264.376)',
          800: 'oklch(.424 .199 265.638)',
          900: 'oklch(.379 .146 265.522)',
        },
        indigo: {
          100: 'oklch(.93 .034 272.788)',
          600: 'oklch(.511 .262 276.966)',
        },
        purple: {
          50: 'oklch(.977 .014 308.299)',
          100: 'oklch(.946 .033 307.174)',
          500: 'oklch(.627 .265 303.9)',
          600: 'oklch(.558 .288 302.321)',
          700: 'oklch(.496 .265 301.924)',
          800: 'oklch(.438 .218 303.724)',
          900: 'oklch(.381 .176 304.987)',
        },
        pink: {
          100: 'oklch(.948 .028 342.258)',
          600: 'oklch(.592 .249 .584)',
        },
        gray: {
          50: 'oklch(.985 .002 247.839)',
          100: 'oklch(.967 .003 264.542)',
          200: 'oklch(.928 .006 264.531)',
          300: 'oklch(.872 .01 258.338)',
          400: 'oklch(.707 .022 261.325)',
          500: 'oklch(.551 .027 264.364)',
          600: 'oklch(.446 .03 256.802)',
          700: 'oklch(.373 .034 259.733)',
          800: 'oklch(.278 .033 256.848)',
          900: 'oklch(.21 .034 264.665)',
        },
        black: '#000',
        white: '#fff',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontSize: {
        'xs': ['.75rem', { lineHeight: 'calc(1 / .75)' }],
        'sm': ['.875rem', { lineHeight: 'calc(1.25 / .875)' }],
        'base': ['1rem', { lineHeight: 'calc(1.5 / 1)' }],
        'lg': ['1.125rem', { lineHeight: 'calc(1.75 / 1.125)' }],
        'xl': ['1.25rem', { lineHeight: 'calc(1.75 / 1.25)' }],
        '2xl': ['1.5rem', { lineHeight: 'calc(2 / 1.5)' }],
        '3xl': ['1.875rem', { lineHeight: 'calc(2.25 / 1.875)' }],
        '4xl': ['2.25rem', { lineHeight: 'calc(2.5 / 2.25)' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      letterSpacing: {
        tight: '-.025em',
        widest: '.1em',
      },
      lineHeight: {
        relaxed: '1.625',
      },
      borderRadius: {
        xs: '.125rem',
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)',
      },
      animation: {
        spin: 'spin 1s linear infinite',
      },
      blur: {
        sm: '8px',
      },
      aspectRatio: {
        video: '16 / 9',
      },
      transitionDuration: {
        DEFAULT: '.15s',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(.4, 0, .2, 1)',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
