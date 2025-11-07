import { NavLink } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import './Navigation.css';

function Navigation() {
  const { theme, setTheme } = useTheme();
  const { cart } = useCart();
  const cartItemsCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="navigation">
      <div className="nav-container">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Главная
        </NavLink>
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Каталог
        </NavLink>
        <NavLink to="/cart" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Корзина {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
        </NavLink>
        <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Вход
        </NavLink>
        <select 
          className="theme-select" 
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

