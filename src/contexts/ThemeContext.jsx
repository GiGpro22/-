import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// получаю тему из localStorage
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  return 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const initial = getInitialTheme();
    // сразу ставим на документ чтобы не мигало
    document.documentElement.setAttribute('data-theme', initial);
    return initial;
  });

  useEffect(() => {
    // сохраняю тему при изменении
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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

