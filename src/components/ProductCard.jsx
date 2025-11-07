import { useCart } from '../contexts/CartContext';
import './ProductCard.css';

function ProductCard({ id, name, price, image }) {
  const { addToCart, cart } = useCart();
  
  const itemInCart = cart.items.find(item => item.id === id);
  const quantity = itemInCart ? itemInCart.quantity : 0;

  const handleAddToCart = () => {
    addToCart({ id, name, price, image });
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={image} alt={name} />
      </div>
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <p className="product-price">{price} ₽</p>
        <div className="product-actions">
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Добавить в корзину
          </button>
          {quantity > 0 && (
            <div className="quantity-badge">
              {quantity}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;

