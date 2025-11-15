import { createContext, useContext, useState, useEffect } from 'react';
import { poluchitKorzinu, dobavitVKorzinu as dobavitVKorzinuAPI, udalitIzKorzini as udalitIzKorziniAPI } from '../api/cart';
import { rasschitatSkidki } from '../api/discounts';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [korzina, setKorzina] = useState({ tovary: [], idKorzini: null, idSessii: null });
  const [zagruzka, setZagruzka] = useState(false);
  const [oshibka, setOshibka] = useState(null);
  const [informaciyaOSkidkah, setInformaciyaOSkidkah] = useState(null);

  // создаю или достаю sessionId для анонимных пользователей
  useEffect(() => {
    let idSessii = localStorage.getItem('cart_session_id');
    if (!idSessii) {
      idSessii = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cart_session_id', idSessii);
    }
    setKorzina(prev => ({ ...prev, idSessii }));
  }, []);

  // загружаю корзину с сервера
  const zagruzitKorzinu = async (idPolzovatelya = null) => {
    try {
      setZagruzka(true);
      setOshibka(null);
      const idSessii = localStorage.getItem('cart_session_id');
      const dannye = await poluchitKorzinu(idPolzovatelya, idSessii);
      
      setKorzina({
        tovary: dannye.items.map(tovar => ({
          id: tovar.product_id,
          nazvanie: tovar.title,
          cena: parseFloat(tovar.price),
          kolichestvo: tovar.quantity,
          idTovara: tovar.product_id,
          idElementaKorzini: tovar.id_cart_item
        })),
        idKorzini: dannye.cartId,
        idSessii: dannye.sessionId
      });

      // если в корзине есть товары, считаю скидки
      if (dannye.items.length > 0) {
        await rasschitatSkidkiKorzini(idPolzovatelya, dannye.items);
      }
    } catch (err) {
      console.error('Ошибка загрузки корзины:', err);
      setOshibka(err.message);
    } finally {
      setZagruzka(false);
    }
  };

  // считаю все скидки для корзины (персональные, на товары, купоны)
  const rasschitatSkidkiKorzini = async (idPolzovatelya, tovary) => {
    try {
      const tovaryKorzini = tovary.map(tovar => ({
        productId: tovar.product_id,
        quantity: tovar.quantity
      }));
      
      const skidki = await rasschitatSkidki(idPolzovatelya, tovaryKorzini);
      setInformaciyaOSkidkah(skidki);
    } catch (err) {
      console.error('Ошибка расчета скидок:', err);
    }
  };

  // добавляю товар в корзину
  const dobavitVKorzinu = async (tovar, idPolzovatelya = null) => {
    try {
      setOshibka(null);
      const idSessii = localStorage.getItem('cart_session_id');
      
      await dobavitVKorzinuAPI({
        userId: idPolzovatelya,
        sessionId: idSessii,
        productId: tovar.id,
        quantity: 1
      });
      
      // после добавления обновляю корзину
      await zagruzitKorzinu(idPolzovatelya);
    } catch (err) {
      console.error('Ошибка добавления в корзину:', err);
      setOshibka(err.message);
    }
  };

  // удаляю товар из корзины
  const udalitIzKorzini = async (idElementaKorzini, idPolzovatelya = null) => {
    try {
      setOshibka(null);
      await udalitIzKorziniAPI(idElementaKorzini);
      await zagruzitKorzinu(idPolzovatelya);
    } catch (err) {
      console.error('Ошибка удаления из корзины:', err);
      setOshibka(err.message);
    }
  };

  // считаю итоговую сумму корзины
  const poluchitObshuyuCenu = () => {
    if (informaciyaOSkidkah) {
      return informaciyaOSkidkah.finalTotal.toFixed(2);
    }
    
    let itogo = 0;
    korzina.tovary.forEach(tovar => {
      itogo += tovar.cena * tovar.kolichestvo;
    });
    return itogo.toFixed(2);
  };

  // очищаю корзину
  const ochistitKorzinu = async (idPolzovatelya = null) => {
    try {
      setOshibka(null);
      const idSessii = localStorage.getItem('cart_session_id');
      await zagruzitKorzinu(idPolzovatelya);
      // корзина очистится на сервере когда создам заказ
    } catch (err) {
      console.error('Ошибка очистки корзины:', err);
    }
  };

  return (
    <CartContext.Provider 
      value={{ 
        korzina, 
        dobavitVKorzinu, 
        udalitIzKorzini, 
        poluchitObshuyuCenu,
        zagruzitKorzinu,
        ochistitKorzinu,
        zagruzka,
        oshibka,
        informaciyaOSkidkah
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const kontekst = useContext(CartContext);
  if (!kontekst) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return kontekst;
};
