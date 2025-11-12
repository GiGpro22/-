import { useCart } from '../contexts/CartContext';
import './ProductCard.css';

function ProductCard({ id, name, price, image }) {
  const { dobavitVKorzinu, cart } = useCart();
  
  // ищу товар в корзине чтобы показать количество
  const quantity = cart.items.find(item => item.id === id)?.quantity || 0;
  // если quantity 0 то не показываю бейдж

  const handleClick = () => {
    dobavitVKorzinu({ id, name, price, image });
    
  };

  return (
    <div className="kartochka_tovara">
      <div className="foto_tovara">
        <img src={image} alt={name} />
      </div>
      <div className="info_tovara">
        <h3 className="nazvanie_tovara">{name}</h3>
        <p className="cena_tovara">{price} ₽</p>
        <div className="knopki_tovara">
          <button className="knopka_dobavit" onClick={handleClick}>
            Добавить в корзину
          </button>
          {quantity > 0 && (
            <div className="badge_kolichestvo">
              {quantity}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;

