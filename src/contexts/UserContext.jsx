import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [polzovatel, setPolzovatel] = useState(() => {
    const sohranennyyPolzovatel = localStorage.getItem('user');
    return sohranennyyPolzovatel ? JSON.parse(sohranennyyPolzovatel) : null;
  });

  const vhod = (dannyePolzovatelya) => {
    // сохраняю все данные пользователя в localStorage, включая роль
    const polzovatelDlyaSohraneniya = {
      id: dannyePolzovatelya.id,
      email: dannyePolzovatelya.email,
      firstName: dannyePolzovatelya.firstName,
      lastName: dannyePolzovatelya.lastName,
      phone: dannyePolzovatelya.phone,
      roleId: dannyePolzovatelya.roleId,
      roleTitle: dannyePolzovatelya.roleTitle,
      personalDiscount: dannyePolzovatelya.personalDiscount
    };
    setPolzovatel(polzovatelDlyaSohraneniya);
    localStorage.setItem('user', JSON.stringify(polzovatelDlyaSohraneniya));
  };

  const vyhod = () => {
    setPolzovatel(null);
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ polzovatel, vhod, vyhod }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const kontekst = useContext(UserContext);
  if (!kontekst) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return kontekst;
};

