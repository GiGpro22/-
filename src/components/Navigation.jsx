import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import './Navigation.css';

function Navigation() {
  const { tema, setTema } = useTheme();
  const { korzina } = useCart();
  const { polzovatel, vyhod } = useUser();
  const navigate = useNavigate();
  
  // суммирую все товары в корзине для отображения бейджа
  const kolichestvoTovarov = korzina.tovary.reduce((itogo, tovar) => itogo + tovar.kolichestvo, 0);

  // возвращаю класс для активной ссылки
  const poluchitKlassSsilki = ({ isActive }) => isActive ? 'ssilka_menu active' : 'ssilka_menu';

  const obrabotatVyhod = () => {
    vyhod();
    navigate('/');
  };

  return (
    <nav className="menu_navigacii">
      <div className="konteyner_menu">
        <NavLink to="/" className={poluchitKlassSsilki}>
          Каталог
        </NavLink>
        <NavLink to="/cart" className={poluchitKlassSsilki}>
          Корзина {kolichestvoTovarov > 0 && <span className="badge_korzina">{kolichestvoTovarov}</span>}
        </NavLink>
        {polzovatel ? (
          <>
            {polzovatel.roleTitle && (polzovatel.roleTitle.toLowerCase().includes('admin') || polzovatel.roleTitle.toLowerCase().includes('админ')) ? (
              <NavLink to="/dashboard" className={poluchitKlassSsilki}>
                Панель администратора
              </NavLink>
            ) : (
              <span className="ssilka_menu" style={{ cursor: 'default', opacity: 0.7 }}>
                {polzovatel.firstName || polzovatel.email}
              </span>
            )}
            <button className="knopka_vihod" onClick={obrabotatVyhod}>
              Выход
            </button>
          </>
        ) : (
          <NavLink to="/login" className={poluchitKlassSsilki}>
            Вход
          </NavLink>
        )}
        <select 
          className="vybor_temi" 
          value={tema} 
          onChange={(e) => setTema(e.target.value)}
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

