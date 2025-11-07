import { useCart } from '../contexts/CartContext';
import '../App.css';

function Cart() {
  const { cart, removeFromCart, getTotalPrice } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="app">
        <header className="app-header">
          <h1 className="shop-title">Корзина</h1>
          <p className="shop-subtitle">Ваша корзина пуста</p>
        </header>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="shop-title">Корзина</h1>
      </header>
      <main className="cart-container">
        <div className="cart-items">
          {cart.items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-info">
                <h3 className="cart-item-name">{item.name}</h3>
                <p className="cart-item-price">{item.price} ₽ × {item.quantity}</p>
              </div>
              <button 
                className="remove-btn" 
                onClick={() => removeFromCart(item.id)}
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
        <div className="cart-total">
          <p className="total-label">Итого:</p>
          <p className="total-price">{getTotalPrice()} ₽</p>
        </div>
      </main>
    </div>
  );
}

export default Cart;

