import ProductCard from './components/ProductCard';
import './App.css';

import bouquet1 from './assets/images/bouquet1.jpg';
import bouquet2 from './assets/images/bouquet2.jpg';
import bouquet3 from './assets/images/bouquet3.jpg';

function App() {
  const products = [
    {
      id: 1,
      name: 'Радужные розы',
      price: 1500,
      image: bouquet1
    },
    {
      id: 2,
      name: 'Корзина с розами',
      price: 1800,
      image: bouquet2
    },
    {
      id: 3,
      name: 'Белые розы',
      price: 1200,
      image: bouquet3
    }
  ];

  return (
    <div className="app">
      <div className="falling-flower">💐</div>
      <div className="falling-flower">🌹</div>
      <div className="falling-flower">💐</div>
      <div className="falling-flower">🌹</div>
      <div className="falling-flower">💐</div>
      <div className="falling-flower">🌹</div>
      <div className="falling-flower">💐</div>
      <div className="falling-flower">🌹</div>
      <div className="falling-flower">💐</div>
      <div className="falling-flower">🌹</div>

      <header className="app-header">
        <h1 className="shop-title">Golden Flower</h1>
        <p className="shop-subtitle">Цветочный магазин</p>
      </header>
      <main className="products-container">
        {products.map(product => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
          />
        ))}
      </main>
    </div>
  );
}

export default App;
