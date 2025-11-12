import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // проверка что поля не пустые (без реальной авторизации)
    if (username.trim() !== '' && password.trim() !== '') {
      navigate('/dashboard');
    }
  };

  return (
    <div className="glavnaya_stranica">
      <header className="zagolovok_stranicy">
        <h1 className="nazvanie_magazina">Вход</h1>
        <p className="podzagolovok">Golden Flower</p>
      </header>
      <main className="konteyner_vhoda">
        <form className="forma_vhoda" onSubmit={handleSubmit}>
          <div className="gruppa_polya">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="gruppa_polya">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="knopka_vhod">
            Войти
          </button>
        </form>
      </main>
    </div>
  );
}

export default Login;

