import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Verificar localStorage ou preferência do sistema, padrão light
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // Verificar preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    // Padrão light mode para melhor visibilidade inicial
    return false;
  });

  useEffect(() => {
    // Aplicar tema ao body e html para compatibilidade com CSS antigo e Tailwind
    const root = document.documentElement;
    const body = document.body;
    
    // Aplicar imediatamente para evitar flash
    if (isDarkMode) {
      root.classList.add('dark');
      body.classList.add('dark-mode');
      root.style.colorScheme = 'dark';
      body.style.backgroundColor = '#0F0F0F';
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark-mode');
      root.style.colorScheme = 'light';
      body.style.backgroundColor = '#FFFFFF';
    }
    
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const setTheme = (mode) => {
    setIsDarkMode(mode === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

