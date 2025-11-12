import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });


  const poluchitObshuyuCenu = () => {
    // считаю общую сумму
    let total = 0;
    cart.items.forEach(item => {
      total += item.price * item.quantity;
    });
    return total;
  };

  const udalitIzKorzini = (productId) => {
    // удаляю товар из корзины
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.filter(item => item.id !== productId)
    }));
  };

  const dobavitVKorzinu = (product) => {
    setCart(prevCart => {
      // проверяю есть ли уже такой товар
      const existingItem = prevCart.items.find(item => item.id === product.id);
      if (existingItem) {
        // если есть увеличиваю количество
        return {
          ...prevCart,
          items: prevCart.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      // если нет добавляю новый
      return {
        ...prevCart,
        items: [...prevCart.items, { ...product, quantity: 1 }]
      };
    });
  };

  return (
    <CartContext.Provider value={{ cart, dobavitVKorzinu, udalitIzKorzini, poluchitObshuyuCenu }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

