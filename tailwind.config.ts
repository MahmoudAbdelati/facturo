import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const token = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        background: token('background'),
        foreground: token('foreground'),
        surface: {
          DEFAULT: token('surface'),
          raised: token('surface-raised'),
        },
        border: token('border'),
        input: token('input'),
        ring: token('ring'),
        muted: {
          DEFAULT: token('muted'),
          foreground: token('muted-foreground'),
        },
        accent: {
          DEFAULT: token('accent'),
          hover: token('accent-hover'),
          foreground: token('accent-foreground'),
          subtle: token('accent-subtle'),
          'subtle-foreground': token('accent-subtle-foreground'),
        },
        success: token('success'),
        warning: token('warning'),
        danger: token('danger'),
        info: token('info'),
      },
      // Page content responds to the width it gets (`@page-xl:` …), not the screen, since the
      // sidebar can be collapsed. Each matches the old screen breakpoint with the sidebar open,
      // less a 17px scrollbar: md 768 − 64 rail − 48 padding − 17 = 639px → 39.5rem;
      // lg 1024 − 240 − 80 − 17 = 687px → 42rem; xl 1280 − 240 − 80 − 17 = 943px → 58rem.
      containers: {
        'page-md': '39.5rem',
        'page-lg': '42rem',
        'page-xl': '58rem',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
    // `expanded:` = lg and up with the sidebar open (see components/layout/sidebar-shell.tsx).
    plugin(({ addVariant }) => {
      addVariant('expanded', '@media (min-width: 1024px) { [data-sidebar="expanded"] & }');
    }),
  ],
};
export default config;
