
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
				sans: ['basis-grotesque-pro', 'sans-serif'],
				basis: ['basis-grotesque-pro', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				dream: {
					teal: 'hsl(180, 85%, 55%)',
					cyan: 'hsl(175, 70%, 45%)',
					seafoam: 'hsl(165, 70%, 65%)',
					dark: 'hsl(220, 25%, 8%)',
					light: 'hsl(180, 60%, 70%)',
					midnight: 'hsl(210, 28%, 10%)',
				},
				oniri: {
					ocean: 'hsl(210, 35%, 18%)',
					teal: 'hsl(180, 85%, 55%)',
					cyan: 'hsl(175, 70%, 45%)',
					dark: 'hsl(220, 25%, 6%)',
					card: 'hsl(210, 25%, 12%)',
					glass: 'rgba(0, 200, 200, 0.02)',
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
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'luminous-pulse': {
					'0%, 100%': { 
						boxShadow: '0 0 15px hsla(180, 85%, 50%, 0.2), 0 0 30px hsla(180, 85%, 50%, 0.1)'
					},
					'50%': { 
						boxShadow: '0 0 25px hsla(180, 85%, 50%, 0.35), 0 0 50px hsla(180, 85%, 50%, 0.2)'
					}
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'glow': {
					'0%, 100%': { opacity: '0.8' },
					'50%': { opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'luminous-pulse': 'luminous-pulse 3s ease-in-out infinite',
				'shimmer': 'shimmer 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite'
			},
			backgroundImage: {
				'dream-gradient': 'linear-gradient(to bottom, hsl(220, 25%, 6%), hsl(180, 40%, 30%))',
				'oniri-gradient': 'linear-gradient(135deg, hsl(220, 25%, 6%) 0%, hsl(210, 28%, 10%) 50%, hsl(200, 25%, 8%) 100%)',
				'oniri-card': 'linear-gradient(135deg, rgba(0, 200, 200, 0.02) 0%, rgba(0, 150, 150, 0.01) 100%)',
				'luminous-gradient': 'linear-gradient(135deg, hsl(180, 85%, 55%) 0%, hsl(175, 70%, 45%) 50%, hsl(195, 80%, 60%) 100%)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
