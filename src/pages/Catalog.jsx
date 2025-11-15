import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { poluchitKategorii } from '../api/categories';
import { poluchitTovary as poluchitUslugi } from '../api/services';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import '../App.css';

function Catalog() {
  const [kategorii, setKategorii] = useState([]);
  const [uslugi, setUslugi] = useState([]);
  const [vybrannyeKategorii, setVybrannyeKategorii] = useState([]);
  const [zagruzka, setZagruzka] = useState(true);
  const [oshibka, setOshibka] = useState(null);
  const { zagruzitKorzinu } = useCart();
  const { polzovatel } = useUser();

  // когда компонент загружается, сразу загружаю корзину
  useEffect(() => {
    zagruzitKorzinu(polzovatel?.id || null);
  }, [polzovatel?.id]);

  // загружаю список всех категорий
  useEffect(() => {
    async function zagruzitKategorii() {
      try {
        const dannye = await poluchitKategorii();
        setKategorii(dannye);
      } catch (err) {
        console.error('Ошибка загрузки категорий:', err);
        setOshibka('Не удалось загрузить категории');
      }
    }
    zagruzitKategorii();
  }, []);

  // загружаю товары, можно фильтровать по категориям
  useEffect(() => {
    async function zagruzitUslugi() {
      try {
        setZagruzka(true);
        const idKategoriy = vybrannyeKategorii.length > 0 ? vybrannyeKategorii : null;
        const dannye = await poluchitUslugi(idKategoriy);
        setUslugi(dannye);
        setOshibka(null);
      } catch (err) {
        console.error('Ошибка загрузки товаров:', err);
        setOshibka('Не удалось загрузить товары');
      } finally {
        setZagruzka(false);
      }
    }
    zagruzitUslugi();
  }, [vybrannyeKategorii]);

  // когда кликают на чекбокс категории, добавляю или убираю её из фильтра
  function obrabotatIzmenenieKategorii(idKategorii) {
    setVybrannyeKategorii(prev => {
      if (prev.includes(idKategorii)) {
        return prev.filter(id => id !== idKategorii);
      } else {
        return [...prev, idKategorii];
      }
    });
  }

  return (
    <div className="glavnaya_stranica">
      <header className="zagolovok_stranicy">
        <h1 className="nazvanie_magazina">Golden Flower</h1>
        <p className="podzagolovok">Цветочный магазин</p>
      </header>
      
      <div className="konteyner_kataloga">
        {/* Aside с фильтрами категорий */}
        <aside className="aside_filtry">
          <h3 className="zagolovok_filtrov">Категории</h3>
          {kategorii.length === 0 ? (
            <p>Загрузка категорий...</p>
          ) : (
            <div className="spisok_kategoriy">
              {kategorii.map(kategoriya => (
                <label key={kategoriya.id_category} className="checkbox_kategoriya">
                  <input
                    type="checkbox"
                    checked={vybrannyeKategorii.includes(kategoriya.id_category)}
                    onChange={() => obrabotatIzmenenieKategorii(kategoriya.id_category)}
                  />
                  <span>{kategoriya.title}</span>
                </label>
              ))}
            </div>
          )}
        </aside>

        {/* Основной контент */}
        <main className="konteyner_tovarov">
          {zagruzka && <p>Загрузка товаров...</p>}
          {oshibka && <p style={{ color: 'red' }}>{oshibka}</p>}
          {!zagruzka && !oshibka && uslugi.length === 0 && (
            <p>Товары не найдены</p>
          )}
          {!zagruzka && !oshibka && uslugi.map(usluga => (
            <ProductCard
              key={usluga.id_product}
              id={usluga.id_product}
              nazvanie={usluga.title}
              cena={usluga.price}
              izobrazhenie={usluga.product_image || '/vite.svg'}
              opisanie={usluga.description}
              dlitelnost={usluga.duration}
              skidka={usluga.discount}
            />
          ))}
        </main>
      </div>
    </div>
  );
}

export default Catalog;
