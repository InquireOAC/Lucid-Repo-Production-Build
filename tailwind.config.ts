
import type { Config } from "tailwindcss";

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
    				'Lato',
    				'ui-sans-serif',
    				'system-ui',
    				'-apple-system',
    				'BlinkMacSystemFont',
    				'Segoe UI',
    				'Roboto',
    				'Helvetica Neue',
    				'Arial',
    				'Noto Sans',
    				'sans-serif'
    			],
    			basis: [
    				'basis-grotesque-pro',
    				'sans-serif'
    			],
    			serif: [
    				'EB Garamond',
    				'ui-serif',
    				'Georgia',
    				'Cambria',
    				'Times New Roman',
    				'Times',
    				'serif'
    			],
    			mono: [
    				'Fira Code',
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
    		colors: {
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			cosmic: {
    				black: 'hsl(250, 25%, 5%)',
    				purple: 'hsl(280, 70%, 55%)',
    				violet: 'hsl(270, 100%, 65%)',
    				blue: 'hsl(220, 80%, 60%)',
    				gold: 'hsl(45, 90%, 60%)',
    				deep: 'hsl(255, 22%, 7%)'
    			},
    			aurora: {
    				purple: 'hsl(280, 70%, 55%)',
    				blue: 'hsl(220, 80%, 60%)',
    				teal: 'hsl(175, 70%, 50%)',
    				violet: 'hsl(270, 100%, 65%)',
    				gold: 'hsl(45, 90%, 60%)'
    			},
    			dream: {
    				purple: 'hsl(280, 70%, 55%)',
    				violet: 'hsl(270, 100%, 65%)',
    				blue: 'hsl(220, 80%, 60%)',
    				gold: 'hsl(45, 90%, 60%)',
    				dark: 'hsl(250, 25%, 5%)',
    				light: 'hsl(280, 60%, 75%)',
    				midnight: 'hsl(255, 22%, 7%)',
    				teal: 'hsl(175, 70%, 50%)',
    				cyan: 'hsl(180, 70%, 55%)',
    				seafoam: 'hsl(165, 70%, 65%)'
    			},
    			oniri: {
    				cosmic: 'hsl(255, 22%, 7%)',
    				purple: 'hsl(280, 70%, 55%)',
    				violet: 'hsl(270, 100%, 65%)',
    				dark: 'hsl(250, 25%, 5%)',
    				card: 'hsl(250, 20%, 8%)',
    				glass: 'rgba(147, 51, 234, 0.02)'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
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
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
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
    			},
    			float: {
    				'0%, 100%': {
    					transform: 'translateY(0)'
    				},
    				'50%': {
    					transform: 'translateY(-10px)'
    				}
    			},
    			'magic-glow': {
    				'0%, 100%': {
    					boxShadow: '0 0 15px hsla(280, 70%, 55%, 0.2), 0 0 30px hsla(280, 70%, 55%, 0.1)'
    				},
    				'50%': {
    					boxShadow: '0 0 30px hsla(280, 70%, 55%, 0.4), 0 0 60px hsla(280, 70%, 55%, 0.2)'
    				}
    			},
    			shimmer: {
    				'0%': {
    					backgroundPosition: '-200% 0'
    				},
    				'100%': {
    					backgroundPosition: '200% 0'
    				}
    			},
    			glow: {
    				'0%, 100%': {
    					opacity: '0.8'
    				},
    				'50%': {
    					opacity: '1'
    				}
    			},
    			'aurora-shift': {
    				'0%, 100%': {
    					backgroundPosition: '0% 50%'
    				},
    				'50%': {
    					backgroundPosition: '100% 50%'
    				}
    			},
    			'page-reveal': {
    				'0%': {
    					opacity: '0',
    					transform: 'translateY(20px) scale(0.98)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'translateY(0) scale(1)'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			float: 'float 6s ease-in-out infinite',
    			'magic-glow': 'magic-glow 3s ease-in-out infinite',
    			shimmer: 'shimmer 3s ease-in-out infinite',
    			glow: 'glow 2s ease-in-out infinite',
    			'aurora-shift': 'aurora-shift 8s ease-in-out infinite',
    			'page-reveal': 'page-reveal 0.5s ease-out forwards'
    		},
    		backgroundImage: {
    			'cosmic-gradient': 'linear-gradient(135deg, hsl(250, 25%, 5%) 0%, hsl(255, 22%, 7%) 50%, hsl(250, 25%, 5%) 100%)',
    			'aurora-gradient': 'linear-gradient(135deg, hsl(280, 70%, 55%) 0%, hsl(270, 100%, 65%) 50%, hsl(220, 80%, 60%) 100%)',
    			'magic-gradient': 'linear-gradient(135deg, hsl(280, 70%, 55%) 0%, hsl(45, 90%, 60%) 100%)',
    			'dream-gradient': 'linear-gradient(to bottom, hsl(250, 25%, 5%), hsl(280, 40%, 25%))',
    			'oniri-gradient': 'linear-gradient(135deg, hsl(250, 25%, 5%) 0%, hsl(255, 22%, 7%) 50%, hsl(250, 25%, 5%) 100%)',
    			'oniri-card': 'linear-gradient(135deg, rgba(147, 51, 234, 0.02) 0%, rgba(124, 58, 237, 0.01) 100%)',
    			'luminous-gradient': 'linear-gradient(135deg, hsl(280, 70%, 55%) 0%, hsl(270, 100%, 65%) 50%, hsl(220, 80%, 60%) 100%)'
    		},
    		boxShadow: {
    			'2xs': 'var(--shadow-2xs)',
    			xs: 'var(--shadow-xs)',
    			sm: 'var(--shadow-sm)',
    			md: 'var(--shadow-md)',
    			lg: 'var(--shadow-lg)',
    			xl: 'var(--shadow-xl)',
    			'2xl': 'var(--shadow-2xl)'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
