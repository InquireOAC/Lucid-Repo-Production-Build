
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
    				black: 'hsl(220, 15%, 6%)',
    				purple: 'hsl(217, 91%, 60%)',
    				violet: 'hsl(220, 80%, 65%)',
    				blue: 'hsl(220, 80%, 60%)',
    				gold: 'hsl(45, 90%, 60%)',
    				deep: 'hsl(220, 13%, 8%)'
    			},
    			aurora: {
    				purple: 'hsl(217, 91%, 60%)',
    				blue: 'hsl(220, 80%, 60%)',
    				teal: 'hsl(175, 70%, 50%)',
    				violet: 'hsl(220, 80%, 65%)',
    				gold: 'hsl(45, 90%, 60%)'
    			},
    			dream: {
    				purple: 'hsl(217, 91%, 60%)',
    				violet: 'hsl(220, 80%, 65%)',
    				blue: 'hsl(220, 80%, 60%)',
    				gold: 'hsl(45, 90%, 60%)',
    				dark: 'hsl(220, 15%, 6%)',
    				light: 'hsl(217, 60%, 75%)',
    				midnight: 'hsl(220, 13%, 8%)',
    				teal: 'hsl(175, 70%, 50%)',
    				cyan: 'hsl(180, 70%, 55%)',
    				seafoam: 'hsl(165, 70%, 65%)'
    			},
    			oniri: {
    				cosmic: 'hsl(220, 13%, 8%)',
    				purple: 'hsl(217, 91%, 60%)',
    				violet: 'hsl(220, 80%, 65%)',
    				dark: 'hsl(220, 15%, 6%)',
    				card: 'hsl(220, 13%, 8%)',
    				glass: 'rgba(59, 130, 246, 0.02)'
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
    					boxShadow: '0 0 15px hsla(217, 91%, 60%, 0.2), 0 0 30px hsla(217, 91%, 60%, 0.1)'
    				},
    				'50%': {
    					boxShadow: '0 0 30px hsla(217, 91%, 60%, 0.4), 0 0 60px hsla(217, 91%, 60%, 0.2)'
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
    			},
    			'glow-pulse': {
    				'0%, 100%': {
    					boxShadow: '0 0 20px hsla(217, 91%, 60%, 0.15)'
    				},
    				'50%': {
    					boxShadow: '0 0 40px hsla(217, 91%, 60%, 0.3), 0 0 60px hsla(263, 60%, 55%, 0.15)'
    				}
    			},
    			'fade-in-up': {
    				'0%': {
    					opacity: '0',
    					transform: 'translateY(16px)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'translateY(0)'
    				}
    			},
    			'gradient-shift': {
    				'0%, 100%': {
    					backgroundPosition: '0% 50%'
    				},
    				'50%': {
    					backgroundPosition: '100% 50%'
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
    			'page-reveal': 'page-reveal 0.5s ease-out forwards',
    			'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
    			'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
    			'gradient-shift': 'gradient-shift 6s ease-in-out infinite'
    		},
    		backgroundImage: {
    			'cosmic-gradient': 'linear-gradient(135deg, hsl(220, 15%, 6%) 0%, hsl(220, 13%, 8%) 50%, hsl(220, 15%, 6%) 100%)',
    			'aurora-gradient': 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(263, 60%, 55%) 50%, hsl(217, 91%, 60%) 100%)',
    			'magic-gradient': 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(263, 60%, 55%) 100%)',
    			'dream-gradient': 'linear-gradient(to bottom, hsl(220, 15%, 6%), hsl(263, 30%, 18%))',
    			'oniri-gradient': 'linear-gradient(135deg, hsl(220, 15%, 6%) 0%, hsl(220, 13%, 8%) 50%, hsl(220, 15%, 6%) 100%)',
    			'oniri-card': 'linear-gradient(135deg, hsl(217, 91%, 60% / 0.02) 0%, hsl(263, 60%, 55% / 0.01) 100%)',
    			'luminous-gradient': 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(263, 60%, 55%) 50%, hsl(217, 91%, 60%) 100%)',
    			'gradient-primary': 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(263, 60%, 55%) 100%)',
    			'gradient-radial': 'radial-gradient(circle at 50% 0%, hsl(217, 91%, 60% / 0.15) 0%, transparent 70%)'
    		},
    		boxShadow: {
    			'2xs': 'var(--shadow-2xs)',
    			xs: 'var(--shadow-xs)',
    			sm: 'var(--shadow-sm)',
    			md: 'var(--shadow-md)',
    			lg: 'var(--shadow-lg)',
    			xl: 'var(--shadow-xl)',
    			'2xl': 'var(--shadow-2xl)',
    			'glow-primary': '0 0 40px hsl(217, 91%, 60% / 0.4)',
    			'glow-secondary': '0 0 30px hsl(263, 60%, 55% / 0.3)'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
