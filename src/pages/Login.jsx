import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { voiti as loginAPI, zaregistrirovat as registerAPI } from '../api/auth';
import { useUser } from '../contexts/UserContext';
import { useCart } from '../contexts/CartContext';
import '../App.css';

function Login() {
  const [etoRegistraciya, setEtoRegistraciya] = useState(false);
  const [email, setEmail] = useState('');
  const [parol, setParol] = useState('');
  const [imia, setImia] = useState('');
  const [familiya, setFamiliya] = useState('');
  const [telefon, setTelefon] = useState('');
  const [oshibka, setOshibka] = useState(null);
  const [zagruzka, setZagruzka] = useState(false);
  const navigate = useNavigate();
  const { vhod } = useUser();
  const { zagruzitKorzinu } = useCart();

  const obrabotatOtpravku = async (e) => {
    e.preventDefault();
    setOshibka(null);
    
    // проверяю что поля заполнены
    if (!email.trim()) {
      setOshibka('Email обязателен');
      return;
    }
    
    if (!parol.trim()) {
      setOshibka('Пароль обязателен');
      return;
    }
    
    // проверяю что email правильный формат
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      setOshibka('Некорректный формат email');
      return;
    }

    // для регистрации пароль должен быть минимум 6 символов
    if (etoRegistraciya && parol.length < 6) {
      setOshibka('Пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      setZagruzka(true);
      
      if (etoRegistraciya) {
        // регистрирую нового пользователя
        const otvet = await registerAPI({
          email,
          password: parol,
          firstName: imia.trim() || null,
          lastName: familiya.trim() || null,
          phone: telefon.trim() || null
        });
        
        // после регистрации автоматически логинюсь
        vhod(otvet.user);
        await zagruzitKorzinu(otvet.user.id);
        navigate('/dashboard');
      } else {
        // обычный вход в систему
        const otvet = await loginAPI(email, parol);
        vhod(otvet.user);
        await zagruzitKorzinu(otvet.user.id);
        navigate('/dashboard');
      }
    } catch (err) {
      setOshibka(err.message || (etoRegistraciya ? 'Ошибка при регистрации' : 'Ошибка при авторизации'));
    } finally {
      setZagruzka(false);
    }
  };

  const pereklyuchitRezhim = () => {
    setEtoRegistraciya(!etoRegistraciya);
    setOshibka(null);
    setEmail('');
    setParol('');
    setImia('');
    setFamiliya('');
    setTelefon('');
  };

  return (
    <div className="glavnaya_stranica">
      <header className="zagolovok_stranicy">
        <h1 className="nazvanie_magazina">{etoRegistraciya ? 'Регистрация' : 'Вход'}</h1>
        <p className="podzagolovok">Golden Flower</p>
      </header>
      <main className="konteyner_vhoda">
        <form className="forma_vhoda" onSubmit={obrabotatOtpravku}>
          {oshibka && (
            <div style={{ 
              color: 'red', 
              marginBottom: '20px', 
              padding: '10px',
              background: '#ffebee',
              borderRadius: '4px'
            }}>
              {oshibka}
            </div>
          )}
          
          {etoRegistraciya && (
            <>
              <div className="gruppa_polya">
                <label htmlFor="firstName">Имя</label>
                <input
                  type="text"
                  id="firstName"
                  value={imia}
                  onChange={(e) => setImia(e.target.value)}
                  disabled={zagruzka}
                />
              </div>
              <div className="gruppa_polya">
                <label htmlFor="lastName">Фамилия</label>
                <input
                  type="text"
                  id="lastName"
                  value={familiya}
                  onChange={(e) => setFamiliya(e.target.value)}
                  disabled={zagruzka}
                />
              </div>
              <div className="gruppa_polya">
                <label htmlFor="phone">Телефон</label>
                <input
                  type="tel"
                  id="phone"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  disabled={zagruzka}
                />
              </div>
            </>
          )}
          
          <div className="gruppa_polya">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={zagruzka}
            />
          </div>
          <div className="gruppa_polya">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={parol}
              onChange={(e) => setParol(e.target.value)}
              required
              disabled={zagruzka}
              minLength={etoRegistraciya ? 6 : undefined}
            />
            {etoRegistraciya && (
              <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>
                Минимум 6 символов
              </small>
            )}
          </div>
          
          <button type="submit" className="knopka_vhod" disabled={zagruzka}>
            {zagruzka ? (etoRegistraciya ? 'Регистрация...' : 'Вход...') : (etoRegistraciya ? 'Зарегистрироваться' : 'Войти')}
          </button>
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={pereklyuchitRezhim}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-color)',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.9rem'
              }}
              disabled={zagruzka}
            >
              {etoRegistraciya 
                ? 'Уже есть аккаунт? Войти' 
                : 'Нет аккаунта? Зарегистрироваться'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Login;
