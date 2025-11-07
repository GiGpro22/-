import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // просто проверяю что поля заполнены, потом можно добавить проверку через api
    if (username && password) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="shop-title">Вход</h1>
        <p className="shop-subtitle">Golden Flower</p>
      </header>
      <main className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn">
            Войти
          </button>
        </form>
      </main>
    </div>
  );
}

export default Login;

