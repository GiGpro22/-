import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// ставим тему до рендера, чтобы не было мерцания
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const theme = savedTheme || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  return theme;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

