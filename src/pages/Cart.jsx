import { useCart } from '../contexts/CartContext';
import '../App.css';

function Cart() {
  const { cart, udalitIzKorzini, poluchitObshuyuCenu } = useCart();

  return (
    <div className="glavnaya_stranica">
      <header className="zagolovok_stranicy">
        <h1 className="nazvanie_magazina">Корзина</h1>
        {cart.items.length === 0 && <p className="podzagolovok">Ваша корзина пуста</p>}
      </header>
      {cart.items.length > 0 && (
        <main className="konteyner_korzini">
          <div className="spisok_tovarov">
            {cart.items.map(item => (
              <div key={item.id} className="element_korzini">
                <div className="info_elementa">
                  <h3 className="nazvanie_elementa">{item.name}</h3>
                  <p className="cena_elementa">{item.price} ₽ × {item.quantity}</p>
                </div>
                <button 
                  className="knopka_udalit" 
                  onClick={() => udalitIzKorzini(item.id)}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
          <div className="blok_itogo">
            <p className="nadpis_itogo">Итого:</p>
            <p className="cena_itogo">{poluchitObshuyuCenu()} ₽</p>
          </div>
        </main>
      )}
    </div>
  );
}

export default Cart;