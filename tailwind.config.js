/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cultura Builder Hub Colors - Dark Mode (padrão)
        'cb-primary': '#22C55E', // Verde vibrante principal (item ativo)
        'cb-primary-dark': '#16A34A', // Verde escuro
        'cb-sidebar': '#1A1A1A', // Background da sidebar (dark) / #F9FAFB (light)
        'cb-background': '#0F0F0F', // Background principal (dark) / #FFFFFF (light)
        'cb-card': '#1F2937', // Background de cards (dark) / #FFFFFF (light)
        'cb-border': '#374151', // Bordas e divisores (dark) / #E5E7EB (light)
        'cb-text-primary': '#FFFFFF', // Texto principal (dark) / #111827 (light)
        'cb-text-secondary': '#9CA3AF', // Texto secundário
        'cb-text-muted': '#6B7280', // Texto desabilitado
        'cb-hover': '#374151', // Background hover (dark) / #F3F4F6 (light)
        'cb-input': '#1F2937', // Background de inputs (dark) / #FFFFFF (light)
        
        // Cores antigas para compatibilidade (manter durante migração)
        'admin-primary': '#4f46e5',
        'admin-secondary': '#6b7280',
        'admin-sidebar': '#111827',
        'admin-background': '#f9fafb',
        'primary': '#4ECDC4',
        'primary-dark': '#3aaaa3',
        'secondary': '#1e3a47',
        'accent': '#95B8D1',
        'background-light': '#f4f7f9',
        'background-dark': '#1e3a47',
        'background-darker': '#152935',
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'ease-in-out-cb': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

