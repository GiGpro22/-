import { NavLink } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import './Navigation.css';

function Navigation() {
  const { theme, setTheme } = useTheme();
  const { cart } = useCart();
  // считаю количество товаров в корзине для бейджа
  const cartItemsCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  // функция для активной ссылки
  const getNavLinkClass = ({ isActive }) => isActive ? 'ssilka_menu active' : 'ssilka_menu';

  return (
    <nav className="menu_navigacii">
      <div className="konteyner_menu">
        <NavLink to="/dashboard" className={getNavLinkClass}>
          Главная
        </NavLink>
        <NavLink to="/" className={getNavLinkClass}>
          Каталог
        </NavLink>
        <NavLink to="/cart" className={getNavLinkClass}>
          Корзина {cartItemsCount > 0 && <span className="badge_korzina">{cartItemsCount}</span>}
        </NavLink>
        <NavLink to="/login" className={getNavLinkClass}>
          Вход
        </NavLink>
        <select 
          className="vybor_temi" 
          value={theme} 
          onChange={(e) => setTheme(e.target.value)}
          aria-label="Выбрать тему"
        >
          <option value="light">Светлая</option>
          <option value="dark">Темная</option>
        </select>
      </div>
    </nav>
  );
}

export default Navigation;

