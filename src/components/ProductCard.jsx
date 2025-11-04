import { useState } from 'react';
import './ProductCard.css';

function ProductCard({ name, price, image }) {
  const [quantity, setQuantity] = useState(0);

  const handleAddToCart = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={image} alt={name} />
      </div>
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <p className="product-price">{price}</p>
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

