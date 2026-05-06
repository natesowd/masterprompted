import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssTypography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			sans: [
  				'Manrope',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif',
  				'Apple Color Emoji',
  				'Segoe UI Emoji',
  				'Segoe UI Symbol',
  				'Noto Color Emoji'
  			],
  			heading: [
  				'Barlow Semi Condensed',
  				'sans-serif'
  			],
  			serif: [
  				'ui-serif',
  				'Georgia',
  				'Cambria',
  				'Times New Roman',
  				'Times',
  				'serif'
  			],
  			mono: [
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'Liberation Mono',
  				'Courier New',
  				'monospace'
  			]
  		},
  		fontSize: {
  			h1: [
  				'3.5rem',
  				{
  					lineHeight: '130%',
  					letterSpacing: '0',
  					fontWeight: '500'
  				}
  			],
  			h2: [
  				'3rem',
  				{
  					lineHeight: '120%',
  					letterSpacing: '0',
  					fontWeight: '600'
  				}
  			],
  			h3: [
  				'2.25rem',
  				{
  					lineHeight: '110%',
  					letterSpacing: '0',
  					fontWeight: '600'
  				}
  			],
  			h4: [
  				'1.875rem',
  				{
  					lineHeight: '110%',
  					letterSpacing: '0',
  					fontWeight: '600'
  				}
  			],
  			h5: [
  				'1.5rem',
  				{
  					lineHeight: '110%',
  					letterSpacing: '0',
  					fontWeight: '600'
  				}
  			],
  			h6: [
  				'1.25rem',
  				{
  					lineHeight: '120%',
  					letterSpacing: '0',
  					fontWeight: '600'
  				}
  			],
  			'subtitle-1': [
  				'1.125rem',
  				{
  					lineHeight: '130%',
  					letterSpacing: '0',
  					fontWeight: '500'
  				}
  			],
  			'subtitle-2': [
  				'1rem',
  				{
  					lineHeight: '130%',
  					letterSpacing: '0',
  					fontWeight: '700'
  				}
  			],
  			'body-1': [
  				'1rem',
  				{
  					lineHeight: '130%',
  					letterSpacing: '0',
  					fontWeight: '500'
  				}
  			],
  			'body-2': [
  				'0.875rem',
  				{
  					lineHeight: '140%',
  					letterSpacing: '0',
  					fontWeight: '500'
  				}
  			],
  			caption: [
  				'0.75rem',
  				{
  					lineHeight: '130%',
  					letterSpacing: '0.5px',
  					fontWeight: '600'
  				}
  			],
  			overline: [
  				'0.625rem',
  				{
  					lineHeight: '130%',
  					letterSpacing: '2px',
  					fontWeight: '600'
  				}
  			]
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: '#1F1F1F',
  				foreground: '#FFFFFF'
  			},
  			secondary: {
  				DEFAULT: '#64DB96',
  				foreground: '#0B2213'
  			},
  			destructive: {
  				DEFAULT: '#F44336',
  				foreground: '#FFFFFF'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				light: 'hsl(var(--muted-light))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			surface: {
  				'50': '#FAFAFA',
  				'100': '#F9F9F9',
  				'200': '#F6F6F6',
  				'300': '#F3F3F3',
  				'400': '#F1F1F1',
  				'500': '#EEEEEE',
  				'600': '#C8C8C8',
  				'700': '#A2A2A2',
  				'800': '#7C7C7C',
  				'900': '#565656'
  			},
  			'brand-primary': {
  				'50': '#C0C0C0',
  				'100': '#AEAEAE',
  				'200': '#8B8B8B',
  				'300': '#676767',
  				'400': '#434343',
  				'500': '#1F1F1F',
  				'600': '#1A1A1A',
  				'700': '#151515',
  				'800': '#101010',
  				'900': '#0B0B0B'
  			},
  			'brand-secondary': {
  				'50': '#D4F5E2',
  				'100': '#C7F2D9',
  				'200': '#AEECC8',
  				'300': '#96E7B8',
  				'400': '#7DE1A7',
  				'500': '#64DB96',
  				'600': '#54B87E',
  				'700': '#449566',
  				'800': '#34724E',
  				'900': '#244F36'
  			},
  			'brand-tertiary': {
  				'50': '#B8E4D2',
  				'100': '#A0D9C3',
  				'200': '#71C4A5',
  				'300': '#42AF87',
  				'400': '#2BA47B',
  				'500': '#149870',
  				'600': '#117F5E',
  				'700': '#0E664C',
  				'800': '#0A4D3A',
  				'900': '#073428'
  			},
  			error: {
  				'50': '#FCCAC7',
  				'500': '#F44336',
  				'900': '#581813',
  				DEFAULT: '#F44336'
  			},
  			warning: {
  				'50': '#FDE7CC',
  				'500': '#F9A849',
  				'900': '#5A3C1A',
  				DEFAULT: '#F9A849'
  			},
  			success: {
  				'50': '#D6EDD5',
  				'500': '#6CC068',
  				'900': '#274525',
  				DEFAULT: '#6CC068'
  			},
  			info: {
  				'50': '#D9F2F5',
  				'500': '#79CFDC',
  				'900': '#2C4B4F',
  				DEFAULT: '#79CFDC'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		spacing: {
  			'30': '7.5rem'
  		},
  		borderRadius: {
  			DEFAULT: 'var(--radius)',
  			sm: 'var(--radius-sm)',
  			lg: 'var(--radius-lg)',
  			xl: 'calc(var(--radius) * 1.5)',
  			'2xl': 'calc(var(--radius) * 2)',
  			full: '9999px'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [tailwindcssTypography, tailwindcssAnimate],
} satisfies Config;