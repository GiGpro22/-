import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// достаю сохраненную тему из localStorage
const poluchitNachalnuyuTemu = () => {
  const sohranennayaTema = localStorage.getItem('theme');
  if (sohranennayaTema) {
    return sohranennayaTema;
  }
  return 'light';
};

export const ThemeProvider = ({ children }) => {
  const [tema, setTema] = useState(() => {
    const nachalnaya = poluchitNachalnuyuTemu();
    // сразу применяю тему к документу, чтобы не было мигания
    document.documentElement.setAttribute('data-theme', nachalnaya);
    return nachalnaya;
  });

  useEffect(() => {
    // когда тема меняется, сохраняю её в localStorage
    localStorage.setItem('theme', tema);
    document.documentElement.setAttribute('data-theme', tema);
  }, [tema]);

  return (
    <ThemeContext.Provider value={{ tema, setTema }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const kontekst = useContext(ThemeContext);
  if (!kontekst) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return kontekst;
};

